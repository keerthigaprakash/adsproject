/**
 * Password Reset Script for Theatre Users
 * Usage: node scripts/resetTheatrePassword.js <email> <newPassword>
 * Example: node scripts/resetTheatrePassword.js prakash@gmail.com newpass123
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');

const email    = process.argv[2];
const newPass  = process.argv[3];

if (!email || !newPass) {
  console.error('Usage: node scripts/resetTheatrePassword.js <email> <newPassword>');
  process.exit(1);
}
if (newPass.length < 6) {
  console.error('Password must be at least 6 characters');
  process.exit(1);
}

const { Sequelize } = require('sequelize');
const config = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect:  'postgres',
  logging:  false,
};

const sequelize = new Sequelize(config);
const { DataTypes } = require('sequelize');

const TheatreUser = sequelize.define('TheatreUser', {
  email:    { type: DataTypes.STRING },
  password: { type: DataTypes.TEXT },
  role:     { type: DataTypes.STRING },
}, { tableName: 'theatre_users', timestamps: false });

(async () => {
  try {
    await sequelize.authenticate();
    const user = await TheatreUser.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      console.error(`❌ No theatre user found with email: ${email}`);
      process.exit(1);
    }
    const hash = await bcrypt.hash(newPass, 10);
    await user.update({ password: hash, role: 'theatre_owner' });
    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`   New password: ${newPass}`);
    console.log(`   Role set to: theatre_owner`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
})();
