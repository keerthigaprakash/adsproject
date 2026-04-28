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
app.use('/ads', require('./routes/adRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/adsets', require('./routes/adsetRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/quotations', require('./routes/quotationRoutes'));
app.use('/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/theatre-auth', require('./routes/theatreAuthRoutes'));
app.use('/api/theatre', require('./routes/theatreAuthRoutes'));          // spec alias
app.use('/api/theatre-requests', require('./routes/theatreRequestRoutes'));

app.get('/', (req, res) => {
  res.send('AdPermit API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
