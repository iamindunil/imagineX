import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    console.debug('Power-to-Weight Ratio (PWR) calculation endpoint hit');
    try {
        const { athlete_id } = req.params;
        console.debug(athlete_id);

        // Query to fetch athlete's vertical jump and weight from the measurements table
        const result = await pool.query('SELECT vertical_jump, weight FROM measurements WHERE athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { vertical_jump, weight } = result.rows[0];

        if (!vertical_jump || !weight) {
            return res.status(400).json({ error: 'Insufficient data to calculate PWR' });
        }

        // Calculate the Power-to-Weight Ratio (PWR)
        const pwr = (vertical_jump * 9.81) / weight;

        return res.json({ athlete_id, pwr });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
