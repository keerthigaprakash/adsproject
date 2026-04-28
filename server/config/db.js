const { Sequelize } = require('sequelize');
const { Pool } = require('pg'); // Still need pg for initial DB creation check
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
  }
);

const ensureDatabaseExists = async () => {
  const tempPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    const res = await tempPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [process.env.DB_NAME]);
    if (res.rowCount === 0) {
      console.log(`Database "${process.env.DB_NAME}" not found. Creating it...`);
      await tempPool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    }
  } catch (err) {
    console.error("Error ensuring database exists:", err);
  } finally {
    await tempPool.end();
  }
};

const seedDatabase = async () => {
  try {
    const User = require('../models/User');
    const Ad = require('../models/Ad');
    const { Wallet } = require('../models/Finance');
    const bcrypt = require('bcryptjs');

    const users = [
      { name: 'Admin',       email: 'admin@gmail.com',      password: 'admin098',  role: 'Admin',       avatar: 'admin_avatar.png' },
      { name: 'Super Admin', email: 'superadmin@gmail.com', password: 'super123',  role: 'Super Admin', avatar: 'admin_avatar.png' },
      // Agents
      { name: 'Ravi',    email: 'ravi@gmail.com',    password: '12345',     role: 'Agent' },
      { name: 'Kavitha', email: 'kavitha@gmail.com', password: '123456',    role: 'Agent' },
      { name: 'Keerthi', email: 'keerthi@gmail.com', password: '1234567',   role: 'Agent' },
      { name: 'Mani',    email: 'mani@gmail.com',    password: '12345678',  role: 'Agent' },
      { name: 'Magi',    email: 'magi@gmail.com',    password: '123456789', role: 'Agent' },
      { name: 'Sri',     email: 'sri@gmail.com',     password: '123457890', role: 'Agent' },
    ];

    for (const u of users) {
      const existingUser = await User.findOne({ where: { email: u.email } });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        const user = await User.create({ ...u, password: hashedPassword });
        await Wallet.create({ user_id: user.id, balance: 0 });
        console.log(`✅ Default user created: ${u.role} (${u.email})`);
      } else {
        // Update avatar if user already exists but has no avatar
        if (u.avatar && !existingUser.avatar) {
          existingUser.avatar = u.avatar;
          await existingUser.save();
        }
      }
    }


    const assetVideos = [
      { id: 101, title: 'vd 1', video_url: 'vd1', status: 'Active', price: 1200, budget: 5000, remaining_budget: 5000, description: 'Premium luxury brand showcase.', gst: 18, commission: 10, creator_id: 1 },
      { id: 102, title: 'vd 2', video_url: 'vd2', status: 'Pending', price: 800, budget: 3000, remaining_budget: 3000, description: 'Dynamic sports apparel advertisement.', gst: 18, commission: 10, creator_id: 1 },
      { id: 103, title: 'vd 3', video_url: 'vd3', status: 'Active', price: 1500, budget: 7500, remaining_budget: 7500, description: 'New tech gadget product reveal.', gst: 18, commission: 10, creator_id: 1 },
      { id: 104, title: 'vd 4', video_url: 'vd4', status: 'Rejected', price: 500, budget: 2000, remaining_budget: 2000, description: 'Summer travel and leisure promo.', gst: 18, commission: 10, creator_id: 1 },
      { id: 105, title: 'vd 5', video_url: 'vd5', status: 'Active', price: 2500, budget: 15000, remaining_budget: 15000, description: 'Automotive excellence and speed.', gst: 18, commission: 10, creator_id: 1 },
      { id: 106, title: 'vd 6', video_url: 'vd6', status: 'Active', price: 1100, budget: 4500, remaining_budget: 4500, description: 'Gourmet dining and food experience.', gst: 18, commission: 10, creator_id: 1 },
      { id: 107, title: 'vd 7', video_url: 'vd7', status: 'Pending', price: 950, budget: 4000, remaining_budget: 4000, description: 'Eco-friendly sustainable lifestyle.', gst: 18, commission: 10, creator_id: 1 },
      { id: 108, title: 'vd 8', video_url: 'vd8', status: 'Active', price: 1350, budget: 6000, remaining_budget: 6000, description: 'Urban fashion and streetwear.', gst: 18, commission: 10, creator_id: 1 },
      { id: 109, title: 'vd 9', video_url: 'vd9', status: 'Active', price: 700, budget: 2500, remaining_budget: 2500, description: 'Home decor and interior design.', gst: 18, commission: 10, creator_id: 1 },
      { id: 110, title: 'vd 10', video_url: 'vd10', status: 'Active', price: 1800, budget: 9000, remaining_budget: 9000, description: 'Next-gen gaming and console promo.', gst: 18, commission: 10, creator_id: 1 },
      { id: 111, title: 'vd 11', video_url: 'vd11', status: 'Pending', price: 400, budget: 1500, remaining_budget: 1500, description: 'Health and wellness app showcase.', gst: 18, commission: 10, creator_id: 1 },
      { id: 112, title: 'vd 12', video_url: 'vd12', status: 'Active', price: 2200, budget: 12000, remaining_budget: 12000, description: 'Corporate finance and consulting.', gst: 18, commission: 10, creator_id: 1 },
      { id: 113, title: 'vd 13', video_url: 'vd13', status: 'Active', price: 3000, budget: 20000, remaining_budget: 20000, description: 'Real estate and luxury properties.', gst: 18, commission: 10, creator_id: 1 }
    ];

    for (const ad of assetVideos) {
      const existingAd = await Ad.findByPk(ad.id);
      if (!existingAd) {
        await Ad.create(ad);
        console.log(`✅ Seeded mock Ad: ${ad.title}`);
      }
    }

  } catch (err) {
    console.error("❌ Seeding Error:", err);
  }
};

const connectDB = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    console.log('PostgreSQL Connected via Sequelize');
    
    require('../models/User');
    require('../models/Finance');
    require('../models/Campaign');
    require('../models/AdSet');
    require('../models/Ad');
    require('../models/Analytics');
    require('../models/Notification');
    require('../models/Quotation');
    require('../models/Request');
    require('../models/TheatreUser');
    require('../models/TheatreRequest');

    await sequelize.sync({ alter: true });
    console.log('✅ Database Schema Synchronized & Ready for Data Storage');
    console.log(`✅ Connected to PostgreSQL Database: ${process.env.DB_NAME} as ${process.env.DB_USER}`);
    
    await seedDatabase();
  } catch (err) {
    console.error('Sequelize Connection Error:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
