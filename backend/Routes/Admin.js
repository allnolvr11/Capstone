const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const AuthToken = require('../middleware/AuthToken');

module.exports = (pool, secretKey) => {
    const router = express.Router();

    router.post('/register', async (req, res) => {
        try {
            const { name, username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const insertUserQuery = 'INSERT INTO admins (name, username, password) VALUES ($1, $2, $3)';
            await pool.query(insertUserQuery, [name, username, hashedPassword]);
            
            res.status(201).json({ message: 'User Registered successfully' });
        } catch (error) {
            console.error('Error Registering user: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    router.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body;
            
            const getUserQuery = 'SELECT * FROM admins WHERE username = $1';
            const { rows } = await pool.query(getUserQuery, [username]);
            
            if (rows.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            
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
    
    router.put('/admins/:id', async (req, res) => {
        const adminId = req.params.id;
        const { name, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (!adminId || !name || !username || !hashedPassword) {
            return res.status(400).json({ error: true, message: 'Provide all necessary information' });
        }
        
        try {
            pool.query('UPDATE admins SET name = $1, username = $2, password = $3 WHERE admin_id = $4', [name, username, hashedPassword, adminId], (err, result) => {
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
    
    router.delete('/admins/:id', (req, res) => {
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
                    res.status(200).json(result.rows);
                }
            });
        } catch (error) {
            console.error('Error deleting admin: ', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    return router;
};
