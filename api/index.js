import express from 'express';
import cors from 'cors';
import fetchCourseRoute from '../server/routes/fetch-course.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/fetch-course', fetchCourseRoute);

app.get('/', (req, res) => {
    res.json({ message: 'Tolzy API is running on Vercel' });
});

export default app;
