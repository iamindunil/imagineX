import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {dirname, join} from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth-route.js';
import athleteCRUDRouter from './crud-operations/athlete-crud.js';
import coachcRUDRouter from './crud-operations/coach-crud.js';
import measurementscRUDRouter from './crud-operations/measurements-crud.js';
import athleteStatCRUDRouter from './crud-operations/athlete-stat-crud.js';
import basicPerformanceCRUDRouter from './crud-operations/basic-performance-crud.js';

import dash100Router from './sports/100m.js';
import dash200Router from './sports/200m.js';
import dash400Router from './sports/400m.js';
import hurdlesRouter from './sports/hurdles.js';
import verticalRouter from './sports/vertical-jump.js';
import longRouter from './sports/long-jump.js';
import trippleRouter from './sports/tripple-jump.js';
import bmiRouter from './calculations/bmi.js';
import ptwRouter from './calculations/ptw.js';

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

app.use('/auth', authRouter);

app.use('/athlete-crud',athleteCRUDRouter);
app.use('/coach-crud',coachcRUDRouter);
app.use('/measurements-crud',measurementscRUDRouter);
app.use('/athlete-stat-crud',athleteStatCRUDRouter);
app.use('/basic-performance-crud',basicPerformanceCRUDRouter);

app.use('/100m-crud', dash100Router);
app.use('/200m-crud',dash200Router);
app.use('/400m-crud',dash400Router);
app.use('/hurdles-crud',hurdlesRouter);
app.use('/vertical-crud',verticalRouter);
app.use('/long-crud',longRouter);
app.use('/tripple-crud',trippleRouter);

app.use('/bmi', bmiRouter);
app.use('/ptw', ptwRouter);

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));