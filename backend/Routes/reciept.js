const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/receipt', async (req, res) => {
        const plateNumber = req.body.plateNumber;
        if (!plateNumber) {
            return res.status(400).json({ error: true, message: 'Please provide plate number' });
        }
    
        try {
            const sessionResult = await pool.query('SELECT * FROM parking_sessions WHERE plate_number = $1 ORDER BY parking_date DESC LIMIT 1', [plateNumber]);
            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ message: 'No parking session found for the provided plate number' });
            }
            const parkingSession = sessionResult.rows[0];
            
            const parkingNumber = parkingSession.parking_number;
            const parkingDate = parkingSession.parking_date;
            const cost = parkingSession.cost;
            
            const insertResult = await pool.query('INSERT INTO receipts (parking_session_id, parking_number, parking_date, cost) VALUES ($1, $2, $3, $4) RETURNING *', [parkingSession.session_id, parkingNumber, parkingDate, cost]);
            const receipt = insertResult.rows[0];
            
            res.status(200).json(receipt);
        } catch (error) {
            console.error('Error generating receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.delete('/receipt/:id', async (req, res) => {
        const receiptId = req.params.id;
        
        if (!receiptId) {
            return res.status(400).json({ error: true, message: 'Please provide receipt ID' });
        }
        
        try {
            await pool.query('DELETE FROM receipts WHERE receipt_id = $1', [receiptId]);
            res.status(200).json({ message: 'Receipt deleted successfully' });
        } catch (error) {
            console.error('Error deleting receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.get('/receipts', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM receipts');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching receipts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    return router;
};
