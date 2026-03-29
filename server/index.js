require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import API routes
const signupRoute = require('./api/auth/signup');
const loginRoute = require('./api/auth/login');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Finance Planner API is running');
});

// API routes
app.use('/api/auth/signup', signupRoute);
app.use('/api/auth/login', loginRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});