// parkedVehicles.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const AuthToken = require('../middleware/AuthToken');

module.exports = (db, secretKey) => {
    router.post('/parkedvehicles', (req, res) => {
        try {
            const copyQuery = `
                INSERT INTO parked_vehicles (license_plate_number, vehicle_type, cost, parking_number, entry_time)
                SELECT license_plate_number, vehicle_type, cost, parking_number, parking_date
                FROM parking_sessions`;
            db.query(copyQuery, (err, result) => {
                if (err) {
                    console.error('Error copying data:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                    return;
                }
                const displayQuery = 'SELECT * FROM parked_vehicles';
                db.query(displayQuery, (err, results) => {
                    if (err) {
                        console.error('Error fetching parked vehicles after copying:', err);
                        res.status(500).json({ message: 'Internal Server Error' });
                        return;
                    }
                    res.status(200).json(results);
                });
            });
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
            // Delete data from parked_vehicles table
            await db.promise().execute('DELETE FROM parked_vehicles WHERE parking_number = ?', [parkingNumber]);
            
            // Retrieve session ID from parking_sessions table
            const [sessionResult] = await db.promise().execute('SELECT session_id FROM parking_sessions WHERE parking_number = ?', [parkingNumber]);
            const sessionId = sessionResult[0].session_id;
            
            // Delete data from receipt_retrieval table
            await db.promise().execute('DELETE FROM receipt_retrieval WHERE session_id = ?', [sessionId]);
            
            // Delete data from receipts table
            await db.promise().execute('DELETE FROM receipts WHERE parking_session_id = ?', [sessionId]);
            
            // Delete data from parking_sessions table
            await db.promise().execute('DELETE FROM parking_sessions WHERE parking_number = ?', [parkingNumber]);
            
            res.status(200).json({ message: 'Data deleted successfully' });
        } catch (error) {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    
    return router;
};