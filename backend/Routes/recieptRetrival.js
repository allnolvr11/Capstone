// recieptRetrival.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const AuthToken = require('../middleware/AuthToken');

module.exports = (db, secretKey) => {
    
    router.post('/retrieveReceipt', (req, res) => {
        const plateNumber = req.body.plateNumber;
        if (!plateNumber) {
            return res.status(400).json({ error: true, message: 'Please provide plate number' });
        }

        try {   
            db.query('SELECT session_id FROM parking_sessions WHERE license_plate_number = ?', [plateNumber], (err, result) => {
                if (err) {
                    console.error('Error checking plate number:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    if (result.length === 0) {
                        res.status(404).json({ message: 'Plate number not found in parking sessions' });
                    } else {
                        const sessionId = result[0].session_id;
                        db.query('SELECT receipt_id FROM receipts WHERE parking_session_id = ? AND DATE(parking_date) = CURDATE()', [sessionId], (err, result) => {
                            if (err) {
                                console.error('Error checking receipt:', err);
                                res.status(500).json({ message: 'Internal Server Error' });
                            } else {
                                if (result.length === 0) {
                                    res.status(404).json({ message: 'No receipt found for today' });
                                } else {
                                    const receiptId = result[0].receipt_id;
                                    db.query('INSERT INTO receipt_retrieval (plate_number, session_id, receipt_id) VALUES (?, ?, ?)', [plateNumber, sessionId, receiptId], (err, result) => {
                                        if (err) {
                                            console.error('Error inserting retrieval request:', err);
                                            res.status(500).json({ message: 'Internal Server Error' });
                                        } else {
                                            // Retrieve the receipt after successful retrieval request
                                            db.query('SELECT * FROM receipts WHERE receipt_id = ?', [receiptId], (err, result) => {
                                                if (err) {
                                                    console.error('Error fetching retrieved receipt:', err);
                                                    res.status(500).json({ message: 'Internal Server Error' });
                                                } else {
                                                    if (result.length === 0) {
                                                        res.status(404).json({ message: 'Retrieved receipt not found' });
                                                    } else {
                                                        const retrievedReceipt = result[0];
                                                        res.status(200).json(retrievedReceipt);
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error processing retrieval request: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
    
    
    return router;
};