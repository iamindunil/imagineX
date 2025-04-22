import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.get('/bmi/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        
        const result = await pool.query('SELECT weight, height FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { weight, height } = result.rows[0];

        if (!weight || !height) {
            return res.status(400).json({ error: 'Insufficient data to calculate BMI' });
        }

        const heightInMeters = height / 100; 
        const bmi = weight / (heightInMeters ** 2);

        return res.json({ athlete_id, bmi });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;