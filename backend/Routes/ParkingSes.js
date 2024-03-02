const express = require('express');
const router = express.Router();

module.exports = (pool, secretKey) => {
    router.post('/park', async (req, res) => {
        try {
            const { plateNumber, vehicleType } = req.body;
            let cost;
            if (vehicleType === 'motorcycle') {
                cost = 20.00;
            } else if (vehicleType === 'car') {
                cost = 40.00;
            } else if (vehicleType === 'e-bike') {
                cost = 30.00;
            } else {
                return res.status(400).json({ error: 'Invalid vehicle type' });
            }
            
            const insertParkingQuery = 'INSERT INTO parking (parking_number, plate_number, vehicle_type, cost) VALUES (DEFAULT, $1, $2, $3) RETURNING parking_number';
            const { rows } = await pool.query(insertParkingQuery, [plateNumber, vehicleType, cost]);
            
            res.status(201).json({ message: 'Parking created successfully', parkingNumber: rows[0].parking_number });
        } catch (error) {
            console.error('Error creating parking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
