const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {

    //register admin
    router.post('/register', async (req, res) => {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcryptjs.hash(password, 10);
            
            const insertUserQuery = 'INSERT INTO admins (username, password) VALUES ($1, $2)';
            await pool.query(insertUserQuery, [username, hashedPassword]);
            
            res.status(201).json({ message: 'User Registered successfully' });
        } catch (error) {
            console.error('Error Registering user: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //login admin
    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            
            const getUserQuery = 'SELECT * FROM admins WHERE username = $1';
            const { rows } = await pool.query(getUserQuery, [username]);
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            const user = rows[0];
            const passwordMatch = await bcryptjs.compare(password, user.password);
            
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            const token = jwt.sign({ userId: user.admin_id, username: user.username }, secretKey, { expiresIn: '5h' });
            
            res.status(200).json({ token });
        } catch (error) {
            console.error('Error logging in user: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //get all admins
    router.get('/admins',  (req, res) => {
        try {
            pool.query('SELECT * FROM admins', (err, result) => {
                if (err) {
                    console.error('Error fetching admins: ', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result.rows);
                }
            });
        } catch (error) {
            console.error('Error loading admins:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //get admin by id
    router.get('/admins/:id', AuthToken.authenticateToken, (req, res) => {
        const adminId = req.params.id;
        if (!adminId) {
            return res.status(400).json({ error: true, message: 'Please provide admin ID' });
        }
        
        try {
            pool.query('SELECT * FROM admins WHERE admin_id = $1', [adminId], (err, result) => {
                if (err) {
                    console.error('Error fetching admin:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result.rows);
                }
            });
        } catch (error) {
            console.error('Error loading admin: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //update admin
    router.put('/admins/:id', async (req, res) => {
        const adminId = req.params.id;
        const { username, password } = req.body;
        const hashedPassword = await bcryptjs.hash(password, 10);
        
        if (!adminId || !username || !hashedPassword) {
            return res.status(400).json({ error: true, message: 'Provide all necessary information' });
        }
        
        try {
            pool.query('UPDATE admins SET username = $1, password = $2 WHERE admin_id = $3', [username, hashedPassword, adminId], (err, result) => {
                if (err) {
                    console.error('Error updating admin:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result.rows);
                }
            });
        } catch (error) {
            console.error('Error updating admin: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    //delete admin
    router.delete('/delAdmin/:id', (req, res) => {
        const adminId = req.params.id;
        
        if (!adminId) {
            return res.status(400).json({ error: true, message: 'Please provide admin ID' });
        }
        
        try {
            pool.query('DELETE FROM admins WHERE admin_id = $1', [adminId], (err, result) => {
                if (err) {
                    console.error('Error deleting admin:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json({ message: 'Admin deleted successfully' });
                }
            });
        } catch (error) {
            console.error('Error deleting admin: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
};
