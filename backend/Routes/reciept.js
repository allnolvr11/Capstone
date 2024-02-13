const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const AuthToken = require('../middleware/AuthToken');

module.exports = (db, secretKey) => {
    
    router.post('/receipt', (req, res) => {
        const plateNumber = req.body.plateNumber;
        if (!plateNumber) {
            return res.status(400).json({ error: true, message: 'Please provide plate number' });
        }
    
        try {
            // Retrieve parking session details using plate number
            db.query('SELECT * FROM parking_sessions WHERE license_plate_number = ? ORDER BY parking_date DESC LIMIT 1', [plateNumber], (err, sessionResult) => {
                if (err) {
                    console.error('Error fetching parking session details:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                if (sessionResult.length === 0) {
                    return res.status(404).json({ message: 'No parking session found for the provided plate number' });
                }
                const parkingSession = sessionResult[0];
                
                // Generate receipt details
                const parkingNumber = parkingSession.parking_number;
                const parkingDate = parkingSession.parking_date;
                const cost = parkingSession.cost;
                
                // Insert generated receipt into the receipts table
                db.query('INSERT INTO receipts (parking_session_id, parking_number, parking_date, cost) VALUES (?, ?, ?, ?)', [parkingSession.session_id, parkingNumber, parkingDate, cost], (err, insertResult) => {
                    if (err) {
                        console.error('Error generating receipt:', err);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                    // Retrieve the inserted receipt
                    db.query('SELECT * FROM receipts WHERE receipt_id = ?', [insertResult.insertId], (err, receiptResult) => {
                        if (err) {
                            console.error('Error fetching generated receipt:', err);
                            return res.status(500).json({ message: 'Internal Server Error' });
                        }
                        if (receiptResult.length === 0) {
                            return res.status(404).json({ message: 'Generated receipt not found' });
                        }
                        const receipt = receiptResult[0];
                        return res.status(200).json(receipt);
                    });
                });
            });
        } catch (error) {
            console.error('Error generating receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.delete('/receipt/:id', (req, res) => {
        const receiptId = req.params.id;
        
        if (!receiptId) {
            return res.status(400).json({ error: true, message: 'Please provide receipt ID' });
        }
        
        try {
            db.query('DELETE FROM receipts WHERE receipt_id = ?', receiptId, (err, result) => {
                if (err) {
                    console.error('Error deleting receipt:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json({ message: 'Receipt deleted successfully' });
                }
            });
        } catch (error) {
            console.error('Error deleting receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.get('/receipts', (req, res) => {
        try {
            db.query('SELECT * FROM receipts', (err, result) => {
                if (err) {
                    console.error('Error fetching receipts:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result);
                }
            });
        } catch (error) {
            console.error('Error loading receipts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    router.delete('/receipt/:id', (req, res) => {
        const receiptId = req.params.id;
        
        if (!receiptId) {
            return res.status(400).json({ error: true, message: 'Please provide receipt ID' });
        }
        
        try {
            db.query('DELETE FROM receipts WHERE receipt_id = ?', receiptId, (err, result) => {
                if (err) {
                    console.error('Error deleting receipt:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json({ message: 'Receipt deleted successfully' });
                }
            });
        } catch (error) {
            console.error('Error deleting receipt: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    

    return router;
};
