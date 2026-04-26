const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database & Models via Sequelize
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));

app.get('/', (req, res) => {
  res.send('AdPermit API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
