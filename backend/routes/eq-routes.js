import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

router.get('/:matchid', authenticateToken, async (req, res) => {
    const { economyRate, bowlingStrikeRate, battingAverage, battingStrikeRate, playerPoints, valueInRupees } = 0;
    try {
        const { matchid } = req.params;
        const { playerid } = req.body;
        const result = await pool.query('SELECT * FROM matches WHERE matchid = $1 && playerid = $2', [matchid, playerid]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'match not found' });

        economyRate = result.rows[0].runsconceded / result.rows[0].oversbowled * 6;
        bowlingStrikeRate = result.rows[0].oversbowled * 6 / result.rows[0].wickets;
        battingAverage = result.rows[0].totalruns / result.rows[0].innignsplayed;
        battingStrikeRate = (result.rows[0].totalruns / result.rows[0].ballsfaced) * 100;
        playerPoints = ((battingStrikeRate / 5) + (battingAverage * 0.8)) + ((500 / bowlingStrikeRate) + (140 / economyRate));
        valueInRupees = Math.round(((9 * playerPoints + 100) * 1000) / 50000) * 50000;

        return res.json({
            economyRate,
            bowlingStrikeRate,
            battingAverage,
            battingStrikeRate,
            playerPoints,
            valueInRupees
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;