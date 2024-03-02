const express = require('express');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    router.post('/ticketretrieval', async (req, res) => {
        const { plate_number } = req.body;
    
        if (!plate_number) {
            return res.status(400).send({ error: true, message: 'Plate number is required' });
        }
    
        try {
            const ticketResult = await pool.query('SELECT * FROM tickets WHERE plate_number = $1 ORDER BY parking_date DESC LIMIT 1', [plate_number]);
    
            if (ticketResult.rowCount === 0) {
                return res.status(404).send({ message: 'No ticket found for the provided plate number' });
            }
    
            const ticket = ticketResult.rows[0];
    
            const retrievalResult = await pool.query('INSERT INTO ticket_retrieval (ticket_id, plate_number) VALUES ($1, $2) RETURNING *', 
            [ticket.ticket_id, ticket.plate_number]);
            const retrieval = retrievalResult.rows[0];
    
            res.status(200).send({ retrieval });
        } catch (error) {
            console.error('Error while retrieving ticket: ', error);
            res.status(500).send({ error: 'Internal Server Error' });
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
