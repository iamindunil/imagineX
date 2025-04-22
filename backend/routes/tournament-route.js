import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get overall match statistics
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                MAX(totalruns) AS highest_runs,
                SUM(totalruns) AS overall_runs,
                SUM(wickets) AS overall_wickets,
                MAX(wickets) AS highest_wickets,
                (SELECT playerid FROM matches ORDER BY totalruns DESC LIMIT 1) AS highest_run_scorer,
                (SELECT playerid FROM matches ORDER BY wickets DESC LIMIT 1) AS highest_wicket_taker,
                SUM(fifties) AS total_fifties,
                SUM(centuries) AS total_centuries
            FROM matches
        `);

        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get statistics for a specific match
router.get('/:matchid/', authenticateToken, async (req, res) => {
    try {
        const { matchid } = req.params;

        const result = await pool.query(`
            SELECT 
                MAX(totalruns) AS highest_runs,
                SUM(totalruns) AS overall_runs,
                SUM(wickets) AS overall_wickets,
                MAX(wickets) AS highest_wickets,
                (SELECT playerid FROM matches WHERE matchid = $1 ORDER BY totalruns DESC LIMIT 1) AS highest_run_scorer,
                (SELECT playerid FROM matches WHERE matchid = $1 ORDER BY wickets DESC LIMIT 1) AS highest_wicket_taker,
                SUM(fifties) AS total_fifties,
                SUM(centuries) AS total_centuries
            FROM matches
            WHERE matchid = $1
        `, [matchid]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Match not found' });

        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;