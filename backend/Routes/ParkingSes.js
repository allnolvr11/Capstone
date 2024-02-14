// ParkingSes.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const AuthToken = require('../middleware/AuthToken');

module.exports = (db, secretKey) => {
    
    router.post('/park', async (req, res) => {
        try {
            const { plateNumber, vehicleType } = req.body;
            let cost;
            if (vehicleType === 'motorcycle') {
                cost = 20.00;
            } else if (vehicleType === 'car') {
                cost = 40.00;
            } else if (vehicleType === 'e-bike') { // New condition for e-bikes
                cost = 30.00;
            } else {
                return res.status(400).json({ error: 'Invalid vehicle type' });
            }
            const parkingNumber = await getNextParkingNumber(db);
            
            const insertParkingSessionQuery = 'INSERT INTO parking_sessions (license_plate_number, parking_number, vehicle_type, cost) VALUES (?, ?, ?, ?)';
            await db.promise().execute(insertParkingSessionQuery, [plateNumber, parkingNumber, vehicleType, cost]);
            
            res.status(201).json({ message: 'Parking session created successfully', parkingNumber });
        } catch (error) {
            console.error('Error creating parking session:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    async function getNextParkingNumber(db) {
        try {
            const selectMaxParkingNumberQuery = 'SELECT COALESCE(MAX(parking_number), 0) + 1 AS nextParkingNumber FROM parking_sessions';
            const result = await db.promise().execute(selectMaxParkingNumberQuery);
            return result[0][0].nextParkingNumber;
        } catch (error) {
            throw error;
        }
    }

    
    return router;
};