const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/retrieveReceipt', async (req, res) => {
        const sessionId = req.body.sessionId;
        if (!sessionId) {
            return res.status(400).json({ error: true, message: 'Please provide session ID' });
        }
    
        try {
            const result = await pool.query('SELECT * FROM receipt_retrieval WHERE session_id = $1', [sessionId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No receipt retrieval found for the provided session ID' });
            }
            const receiptRetrieval = result.rows[0];
            
            res.status(200).json(receiptRetrieval);
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
