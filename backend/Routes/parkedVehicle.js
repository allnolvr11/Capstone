const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/parkedvehicles', async (req, res) => {
        try {
            // Check if parking sessions exist before copying data
            const checkSessionsQuery = 'SELECT COUNT(*) AS sessionCount FROM parking_sessions';
            const { rows: sessionCountResult } = await pool.query(checkSessionsQuery);
            const sessionCount = parseInt(sessionCountResult[0].sessionCount);

            if (sessionCount === 0) {
                return res.status(400).json({ error: true, message: 'No parking sessions available to copy' });
            }

            // Insert data into parked_vehicles from parking_sessions
            const copyQuery = `
                INSERT INTO parked_vehicles (license_plate_number, vehicle_type, cost, parking_number, entry_time)
                SELECT license_plate_number, vehicle_type, cost, parking_number, parking_date
                FROM parking_sessions`;
                
            await pool.query(copyQuery);
            
            const displayQuery = 'SELECT * FROM parked_vehicles';
            const { rows } = await pool.query(displayQuery);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error copying data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.delete('/parkedvehicle/:parkingNumber', async (req, res) => {
        const parkingNumber = req.params.parkingNumber;
        
        if (!parkingNumber) {
            return res.status(400).json({ error: true, message: 'Please provide parking number' });
        }
        
        try {
            await Promise.all([
                // Delete data from parked_vehicles table
                pool.query('DELETE FROM parked_vehicles WHERE parking_number = $1', [parkingNumber]),
                
                // Retrieve session ID from parking_sessions table
                pool.query('SELECT session_id FROM parking_sessions WHERE parking_number = $1', [parkingNumber])
                     .then(({ rows }) => rows[0].session_id)
                     .then(sessionId => Promise.all([
                         // Delete data from receipt_retrieval table
                         pool.query('DELETE FROM receipt_retrieval WHERE session_id = $1', [sessionId]),
                         
                         // Delete data from receipts table
                         pool.query('DELETE FROM receipts WHERE parking_session_id = $1', [sessionId]),
                         
                         // Delete data from parking_sessions table
                         pool.query('DELETE FROM parking_sessions WHERE parking_number = $1', [parkingNumber])
                     ]))
            ]);

            res.status(200).json({ message: 'Data deleted successfully' });
        } catch (error) {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
};
