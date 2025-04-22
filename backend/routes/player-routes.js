import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all players
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM players');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific player
router.get('/:playername', authenticateToken, async (req, res) => {
    try {
        const { playerid } = req.params;
        const result = await pool.query('SELECT * FROM players WHERE playerid = $1', [playerid]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'player not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create new player
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { playerid, playername, speciality, price, university} = req.body;
        await pool.query(
            'INSERT INTO players (playerid, playername, speciality, price, university) VALUES ($1, $2, $3, $4, $5)',
            [playerid, playername, speciality, price, university]
        );
        return res.status(201).json({ message: 'player created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update player
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { playerid, playername, speciality, price, university } = req.body;
        await pool.query(
            'UPDATE players SET playername = $2, speciality = $3, price = $4, university = $5 WHERE playerid = $1',
            [playerid, playername, speciality, price, university]
        );
        res.json({ message: 'player updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete player
router.delete('/:playerid', authenticateToken, async (req, res) => {
    try {
        const { playerid } = req.params;
        await pool.query('DELETE FROM players WHERE playerid = $1', [playerid]);
        res.json({ message: 'player deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;