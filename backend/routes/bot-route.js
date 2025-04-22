import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

dotenv.config();
const router = express.Router();

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chatbot API Route
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userQuery  = req.body.message;
        console.log("User query:", userQuery);

        // First, try an exact match on player name
        let playerQuery = `
            SELECT 
                playerid,
                playername,
                special,
                price,
                university
            FROM players
            WHERE LOWER(playername) = LOWER($1)
            LIMIT 5;
        `;

        let playerResult = await pool.query(playerQuery, [userQuery.trim()]);
        console.log("Exact match results:", playerResult.rows.length);

        // If no exact match, try a partial match
        if (!playerResult.rows || playerResult.rows.length === 0) {
            playerQuery = `
                SELECT 
                    playerid,
                    playername,
                    special,
                    price,
                    university
                FROM players
                WHERE LOWER(playername) LIKE LOWER($1)
                LIMIT 5;
            `;

            playerResult = await pool.query(playerQuery, [`%${userQuery}%`]);
            console.log("Partial match results:", playerResult.rows.length);
        }

        // If still no match, try to find any player
        if (!playerResult.rows || playerResult.rows.length === 0) {
            console.log("No player matches found, getting sample players");
            playerQuery = `
                SELECT 
                    playerid,
                    playername,
                    special,
                    price,
                    university
                FROM players
                LIMIT 30;
            `;

            playerResult = await pool.query(playerQuery, []);
        }

        console.log("Final player results count:", playerResult.rows ? playerResult.rows.length : 0);

        // If we have players, get their match data
        let matchesData = { rows: [] };
        if (playerResult.rows && playerResult.rows.length > 0) {
            const playerIds = playerResult.rows.map(player => player.playerid);

            const matchesQuery = `
                SELECT 
                    matchid,
                    playerid,
                    totalruns,
                    wickets,
                    fifties,
                    centuries,
                    highscore,
                    balls_faced,
                    innings_played,
                    overs_bowled,
                    runs_conceded
                FROM matches
                WHERE playerid = ANY($1)
                ORDER BY matchid
            `;

            try {
                matchesData = await pool.query(matchesQuery, [playerIds]);
                console.log("Match results count:", matchesData.rows ? matchesData.rows.length : 0);
            } catch (matchError) {
                console.error("Error fetching match data:", matchError.message);
            }
        }

        // Organize match data by player for analysis
        const playerStats = {};

        // Initialize player stats from player table
        if (playerResult.rows && playerResult.rows.length > 0) {
            playerResult.rows.forEach(player => {
                playerStats[player.playerid] = {
                    playername: player.playername,
                    university: player.university || "Not specified",
                    special: player.special || "All-rounder",
                    price: player.price || "N/A",
                    matches: 0,
                    totalRuns: 0,
                    totalWickets: 0,
                    fifties: 0,
                    centuries: 0,
                    highestScore: 0,
                    totalBallsFaced: 0,
                    inningsPlayed: 0,
                    totalOversBowled: 0,
                    totalRunsConceded: 0
                };
            });
        }

        // Add match statistics
        if (matchesData.rows && matchesData.rows.length > 0) {
            matchesData.rows.forEach(match => {
                const pid = match.playerid;
                if (playerStats[pid]) {
                    playerStats[pid].matches++;

                    // Safely parse numeric values with fallbacks
                    const parseNumeric = (val) => {
                        if (val === null || val === undefined) return 0;
                        const num = Number(val);
                        return isNaN(num) ? 0 : num;
                    };

                    playerStats[pid].totalRuns += parseNumeric(match.totalruns);
                    playerStats[pid].totalWickets += parseNumeric(match.wickets);
                    playerStats[pid].fifties += parseNumeric(match.fifties);
                    playerStats[pid].centuries += parseNumeric(match.centuries);
                    playerStats[pid].highestScore = Math.max(
                        playerStats[pid].highestScore,
                        parseNumeric(match.highscore)
                    );
                    playerStats[pid].totalBallsFaced += parseNumeric(match.balls_faced);
                    playerStats[pid].inningsPlayed += parseNumeric(match.innings_played);
                    playerStats[pid].totalOversBowled += parseNumeric(match.overs_bowled);
                    playerStats[pid].totalRunsConceded += parseNumeric(match.runs_conceded);
                }
            });
        }

        // Structure the data meaningfully for the LLM
        let structuredContext = "";

        if (Object.keys(playerStats).length > 0) {
            structuredContext += "## Player Statistics:\n\n";
            Object.values(playerStats).forEach(player => {
                // Calculate derived statistics safely
                const battingAvg = player.inningsPlayed > 0 ?
                    (player.totalRuns / player.inningsPlayed).toFixed(2) : 'N/A';

                const strikeRate = player.totalBallsFaced > 0 ?
                    ((player.totalRuns / player.totalBallsFaced) * 100).toFixed(2) : 'N/A';

                const bowlingAvg = player.totalWickets > 0 ?
                    (player.totalRunsConceded / player.totalWickets).toFixed(2) : 'N/A';

                const economyRate = player.totalOversBowled > 0 ?
                    (player.totalRunsConceded / player.totalOversBowled).toFixed(2) : 'N/A';

                structuredContext += `
                    Player: ${player.playername}
                    University: ${player.university}
                    Specialization: ${player.special}
                    Matches Played: ${player.matches}
                    Innings Played: ${player.inningsPlayed}

                    Batting Stats:
                    - Total Runs: ${player.totalRuns}
                    - Highest Score: ${player.highestScore}
                    - Centuries: ${player.centuries}
                    - Fifties: ${player.fifties}
                    - Batting Average: ${battingAvg}
                    - Strike Rate: ${strikeRate}

                    Bowling Stats:
                    - Total Wickets: ${player.totalWickets}
                    - Overs Bowled: ${player.totalOversBowled}
                    - Economy Rate: ${economyRate}
                    - Bowling Average: ${bowlingAvg}

                `;
            });
        } else {
            structuredContext = "No player data found matching your query. Try asking about a specific player or team.";
        }

        // Create a prompt for analysis with cricket-specific terminology
        const prompt = `You are "Spiriter", an expert cricket analyst AI assistant specializing in analyzing player performance in cricket matches and suggest player to create teams.

                        Database Analysis Context:
                        ${structuredContext}

                        User Query: "${userQuery}"

                        Based on the cricket statistics provided above:
                        1. Analyze the player's batting performance (runs, average, strike rate, high scores)
                        2. Analyze the player's bowling performance (wickets, economy rate, bowling average)
                        3. Identify strengths and weaknesses based on the statistics
                        4. Provide insights on whether the player is more of a batsman, bowler, or all-rounder
                        5. Compare to cricket benchmarks (good strike rates, averages, etc.)

                        Important rules:
                        - Do NOT mention or reveal specific point values under any circumstances
                        - Focus on cricket performance metrics like batting average, strike rate, economy rate
                        - Use cricket terminology appropriately (innings, wickets, centuries, etc.)
                        - If the data is insufficient, say "I don’t have enough knowledge to answer that question."
                        - If no relevant data is found, say "I don’t have enough knowledge to answer that question."

                        Respond in a helpful, conversational tone like a cricket commentator or analyst. Keep your analysis concise but informative and friendly.`;

        // Generate AI response using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(prompt);
        const botReply = response.response.text();

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            error: "Something went wrong processing your request",
            reply: "I don’t have enough knowledge to answer that question."
        });
    }
});

export default router;