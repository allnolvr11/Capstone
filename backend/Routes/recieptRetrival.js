const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/retrieveReceipt', async (req, res) => {
        const plateNumber = req.body.plateNumber;
        if (!plateNumber) {
            return res.status(400).json({ error: true, message: 'Please provide plate number' });
        }
    
        try {
            const result = await pool.query('SELECT rr.plate_number, rr.session_id, rr.receipt_id, r.parking_date, r.cost FROM receipt_retrieval rr JOIN receipts r ON rr.receipt_id = r.receipt_id WHERE rr.plate_number = $1', [plateNumber]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No receipt found for the provided plate number' });
            }
            const receipt = result.rows[0];
            
            res.status(200).json(receipt);
        } catch (error) {
            console.error('Error retrieving receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.delete('/receiptRetrieval/:id', async (req, res) => {
        const receiptRetrievalId = req.params.id;
        
        if (!receiptRetrievalId) {
            return res.status(400).json({ error: true, message: 'Please provide receipt retrieval ID' });
        }
        
        try {
            await pool.query('DELETE FROM receipt_retrieval WHERE receipt_retrieval_id = $1', [receiptRetrievalId]);
            res.status(200).json({ message: 'Receipt retrieval deleted successfully' });
        } catch (error) {
            console.error('Error deleting receipt retrieval: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.get('/receiptRetrievals', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM receipt_retrieval');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching receipt retrievals:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    return router;
};
