const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const uploadRoutes = require('./routes/upload');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', uploadRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Visual Product Matcher API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});