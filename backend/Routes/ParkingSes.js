const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
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
            const parkingNumber = await getNextParkingNumber(pool);
            
            const insertParkingSessionQuery = 'INSERT INTO parking_sessions (plate_number, parking_number, vehicle_type, cost) VALUES ($1, $2, $3, $4)';
            await pool.query(insertParkingSessionQuery, [plateNumber, parkingNumber, vehicleType, cost]);
            
            res.status(201).json({ message: 'Parking session created successfully', parkingNumber });
        } catch (error) {
            console.error('Error creating parking session:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    async function getNextParkingNumber(pool) {
        try {
            const selectMaxParkingNumberQuery = 'SELECT COALESCE(MAX(parking_number), 0) + 1 AS nextParkingNumber FROM parking_sessions';
            const { rows } = await pool.query(selectMaxParkingNumberQuery);
            return rows[0].nextParkingNumber;
        } catch (error) {
            throw error;
        }
    }

    return router;
};
