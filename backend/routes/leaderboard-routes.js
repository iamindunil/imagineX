import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all leaderboards
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM leaderboard ORDER BY total_points ASC');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// Get specific leaderboard
router.get('/:teamname', authenticateToken, async (req, res) => {
    try {
        const { teamname } = req.params;
        const { username } = req.body;
        const result = await pool.query('SELECT * FROM leaderboards WHERE teamname = $1 && owner = $2', [teamname, username]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'leaderboard not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create new leaderboard
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { teamname, totalpoints, username } = req.body;
        await pool.query(
            'INSERT INTO leaderboards (teamname, total_points, owner) VALUES ($1, $2, $3)',
            [teamname, totalpoints, username]
        );
        return res.status(201).json({ message: 'leaderboard created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update leaderboard
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { teamname, totalpoints, username } = req.body;
        await pool.query(
            'UPDATE leaderboards SET total_points = $2 WHERE teamname = $1 && owner = $3',
            [teamname, totalpoints, username]
        );
        res.json({ message: 'leaderboard updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete leaderboard
router.delete('/:teamname', authenticateToken, async (req, res) => {
    try {
        const { teamname } = req.params;
        const { username } = req.body;
        await pool.query('DELETE FROM leaderboards WHERE teamname = $1 && owner = $2', [teamname, username]);
        res.json({ message: 'leaderboard deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;