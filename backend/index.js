import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {dirname, join} from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth-route.js';
import userRouter from './routes/user-routes.js';
import botRouter from './routes/bot-route.js';
import adminRouter from './routes/admin-routes.js';
import eqRouter from './routes/eq-routes.js';
import leaderBoardRouter from './routes/leaderboard-routes.js';
import matchesRouter from './routes/matches-routes.js';
import playerRouter from './routes/player-routes.js';
import teamsRouter from './routes/team-routes.js';
import tournamentRouter from './routes/tournament-route.js';
import playerscrRouter from './routes/playerxscr-route.js';


dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const origin = process.env.origin || 'http://localhost:3000';

const corsOptions = {credentials: true, origin: origin};

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());
app.use('/',express.static(join(__dirname, 'public')));

/* Define routes */ 
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/bot', botRouter);
app.use('/admin', adminRouter);
app.use('/eq', eqRouter);
app.use('/leaderboard', leaderBoardRouter);
app.use('/matches', matchesRouter);
app.use('/players', playerRouter);
app.use('/teams', teamsRouter);
app.use('/tournament', tournamentRouter);
app.use('/scr', playerscrRouter);

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));