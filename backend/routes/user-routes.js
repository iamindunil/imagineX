import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all users
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT username FROM users');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific user
router.get('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );
        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update user
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'UPDATE users SET password = $1 WHERE username = $2',
            [hashedPassword, username]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
router.delete('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        await pool.query('DELETE FROM users WHERE username = $1', [username]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;