import express, { Application } from 'express';
import cors from 'cors';
import apiRouters from './routes/api.routes.js';
import { observabilityMiddleware } from './middlewares/obervability.middleware.js';

const app: Application = express();

// Enable JSON and CORS and Observability(Perform) 
app.use(express.json());
app.use(cors());
app.use(observabilityMiddleware);

// Path Prefix API
app.use('/api/v1', apiRouters);

export default app;