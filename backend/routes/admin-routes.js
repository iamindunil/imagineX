import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all admins
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admin');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific admin
router.get('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const result = await pool.query('SELECT username FROM admin WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'admin not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create new admin
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO admin (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );
        return res.status(201).json({ message: 'admin created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update admin
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'UPDATE admin SET password = $1 WHERE username = $2',
            [hashedPassword, username]
        );
        res.json({ message: 'admin updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete admin
router.delete('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        await pool.query('DELETE FROM admin WHERE username = $1', [username]);
        res.json({ message: 'admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;