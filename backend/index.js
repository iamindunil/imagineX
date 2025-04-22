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
app.use('/athlete-crud',athleteCRUDRouter);
app.use('/coach-crud',coachcRUDRouter);
app.use('/measurements-crud',measurementscRUDRouter);
app.use('/athlete-stat-crud',athleteStatCRUDRouter);
app.use('/basic-performance-crud',basicPerformanceCRUDRouter);

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));