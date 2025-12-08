const express = require('express');
const cors = require('cors');
const fetchCourseRoute = require('../server/routes/fetch-course');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/fetch-course', fetchCourseRoute);

app.get('/', (req, res) => {
    res.json({ message: 'Tolzy API is running on Vercel' });
});

module.exports = app;
