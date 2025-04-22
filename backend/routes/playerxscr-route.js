import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all players
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`SELECT 
                                            p.playerid AS id,
                                            p.playername AS name,
                                            p.university,
                                            p.price,
                                            p.special AS type,
                                            -- Batting Stats
                                            SUM(m.totalruns) AS runs,
                                            ROUND(
                                                CASE 
                                                    WHEN COUNT(m.matchid) = 0 THEN 0 
                                                    ELSE SUM(m.totalruns) / COUNT(m.matchid) 
                                                END, 2
                                            ) AS average,
                                            ROUND(
                                                CASE 
                                                    WHEN SUM(m.balls_faced) = 0 THEN 0
                                                    ELSE SUM(m.totalruns) / SUM(m.balls_faced) * 100 
                                                END, 2
                                            ) AS strikeRate,
                                            COUNT(m.matchid) AS matches,
                                            MAX(m.totalruns) AS highscore,  -- Highscore
                                            COUNT(DISTINCT m.matchid) AS innings_played,  -- Innings Played
                                            SUM(m.balls_faced) AS balls_faced,  -- Balls Faced
                                            SUM(CASE WHEN m.totalruns >= 50 AND m.totalruns < 100 THEN 1 ELSE 0 END) AS fifties,  -- Fifties
                                            SUM(CASE WHEN m.totalruns >= 100 THEN 1 ELSE 0 END) AS centuries,  -- Centuries
                                            
                                            -- Bowling Stats
                                            SUM(m.wickets) AS wickets,  -- Wickets
                                            SUM(m.overs_bowled) AS overs_bowled,  -- Overs Bowled
                                            SUM(m.runs_conceded) AS runs_conceded,  -- Runs Conceded
                                            ROUND(
                                                CASE 
                                                    WHEN SUM(m.overs_bowled) = 0 THEN 0
                                                    ELSE SUM(m.runs_conceded) / SUM(m.overs_bowled) 
                                                END, 2
                                            ) AS economy_rate,  -- Economy Rate
                                            ROUND(
                                                CASE 
                                                    WHEN SUM(m.runs_conceded) = 0 OR SUM(m.wickets) = 0 THEN 0
                                                    ELSE SUM(m.overs_bowled*6) / SUM(m.wickets)
                                                END, 2
                                            ) AS bowling_strike_rate  -- Bowling Strike Rate
                                        FROM 
                                            players p
                                        JOIN 
                                            matches m ON p.playerid = m.playerid
                                        GROUP BY 
                                            p.playerid, p.playername, p.university, p.price, p.special;

                                        `);
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;