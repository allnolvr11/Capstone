const express = require('express');
const router = express.Router();

module.exports = (pool, secretKey) => {
    router.post('/ticket', async (req, res) => {
        const { plate_number } = req.body;
    
        if (!plate_number) {
            return res.status(400).send({ error: true, message: 'Plate number is required' });
        }
    
        try {
            const parkingResult = await pool.query('SELECT * FROM parking WHERE plate_number = $1 ORDER BY parking_date DESC LIMIT 1', [plate_number]);
    
            if (parkingResult.rowCount === 0) {
                return res.status(404).send({ message: 'No parking record found for the provided plate number' });
            }
    
            const parkingRecord = parkingResult.rows[0];
    
            const ticketResult = await pool.query('INSERT INTO tickets (plate_number, parking_id, vehicle_type, cost, parking_date) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [parkingRecord.plate_number, parkingRecord.parking_id, parkingRecord.vehicle_type, parkingRecord.cost, parkingRecord.parking_date]);
            const ticket = ticketResult.rows[0];
    
            res.status(200).send({ ticket });
        } catch (error) {
            console.error('Error while generating ticket: ', error);
            res.status(500).send({ error: 'Internal Server Error' });
        }
    });
    

    router.get('/tickets', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM tickets');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

router.delete('/ticket/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({ error: true, message: 'Ticket ID is required' });
    }

    try {
        const deleteResult = await pool.query('DELETE FROM tickets WHERE ticket_id = $1 RETURNING *', [id]);

        if (deleteResult.rowCount === 0) {
            return res.status(404).send({ message: 'No ticket found with the provided ID' });
        }

        res.status(200).send({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error while deleting ticket: ', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
    
    return router;
};
