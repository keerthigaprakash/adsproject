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
    const { Wallet } = require('../models/Finance');
    const bcrypt = require('bcryptjs');

    const users = [
      { name: 'Admin', email: 'admin@gmail.com', password: 'admin098', role: 'Admin' },
      { name: 'Super Admin', email: 'superadmin@gmail.com', password: 'super123', role: 'Super Admin' }
    ];

    for (const u of users) {
      const existingUser = await User.findOne({ where: { email: u.email } });
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(u.password, salt);
        const user = await User.create({ ...u, password: hashedPassword });
        await Wallet.create({ user_id: user.id, balance: 0 });
        console.log(`✅ Default user created: ${u.role} (${u.email})`);
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
    
    await sequelize.sync({ alter: true });
    console.log('Database Schema Synchronized');
    
    await seedDatabase();
  } catch (err) {
    console.error('Sequelize Connection Error:', err);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
