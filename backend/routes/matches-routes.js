import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all matches
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM matches');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific match
router.get('/:matchid', authenticateToken, async (req, res) => {
    try {
        const { matchid } = req.params;
        const { playerid } = req.body;
        const result = await pool.query('SELECT * FROM matches WHERE matchid = $1 && playerid = $2', [matchid, playerid]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'match not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create new match
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { matchid, playerid, totalruns, wickets, fifties, centuries, highscore, points, ballsfaced, innignsplayed, oversbowled, runsconceded } = req.body;
        await pool.query(
            'INSERT INTO matches (matchid, playerid, totalruns, wickets, fifties, centuries, highscore, points, ballsfaced, innignsplayed, oversbowled, runsconceded) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [matchid, playerid, totalruns, wickets, fifties, centuries, highscore, points, ballsfaced, innignsplayed, oversbowled, runsconceded]
        );
        return res.status(201).json({ message: 'match created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update match
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { matchid, playerid, totalruns, wickets, fifties, centuries, highscore, points, ballsfaced, innignsplayed, oversbowled, runsconceded } = req.body;
        await pool.query(
            'UPDATE matches SET totalruns = $3, wickets = $4, fifties = $5, centuries = $6, highscore = $7, points = $8, ballsfaced = $9, innignsplayed = $10, oversbowled = $11, runsconceded = $12 WHERE matchid = $1 && playerid = $2',
            [matchid, playerid, totalruns, wickets, fifties, centuries, highscore, points, ballsfaced, innignsplayed, oversbowled, runsconceded]
        );
        res.json({ message: 'match updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete match
router.delete('/:matchid', authenticateToken, async (req, res) => {
    try {
        const { matchid } = req.params;
        const { playerid } = req.body;
        await pool.query('DELETE FROM matches WHERE matchid = $1 && playerid = $2', [matchid, playerid]);
        res.json({ message: 'match deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;