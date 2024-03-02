const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/parkedvehicles', async (req, res) => {
        try {
            // Check if parking records exist before copying data
            const checkParkingQuery = 'SELECT COUNT(*) AS parkingCount FROM parking';
            const { rows: parkingCountResult } = await pool.query(checkParkingQuery);
            const parkingCount = parseInt(parkingCountResult[0].parkingCount);
    
            if (parkingCount === 0) {
                return res.status(400).json({ error: true, message: 'No parking records available to copy' });
            }
    
            // Insert data into parked_vehicles from parking
            const copyQuery = `
                INSERT INTO parked_vehicles (plate_number, parking_id)
                SELECT plate_number, parking_id
                FROM parking
                WHERE parking_id NOT IN (SELECT parking_id FROM parked_vehicles)`;
                
            await pool.query(copyQuery);
            
            const displayQuery = 'SELECT * FROM parked_vehicles';
            const { rows } = await pool.query(displayQuery);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error copying data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.delete('/parkedvehicle/:parkingId', async (req, res) => {
        const parkingId = req.params.parkingId;
        
        if (!parkingId) {
            return res.status(400).json({ error: true, message: 'Please provide parking id' });
        }
        
        try {
            // Start a transaction
            await pool.query('BEGIN');
    
            // Delete data from parked_vehicles table
            await pool.query('DELETE FROM parked_vehicles WHERE parking_id = $1', [parkingId]);
    
            // Delete data from parking table
            await pool.query('DELETE FROM parking WHERE parking_id = $1', [parkingId]);
    
            // Commit the transaction
            await pool.query('COMMIT');
    
            res.status(200).json({ message: 'Data deleted successfully' });
        } catch (error) {
            // If an error occurs, rollback the transaction
            await pool.query('ROLLBACK');
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    return router;
};
