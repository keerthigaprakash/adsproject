const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TheatreUser = sequelize.define('TheatreUser', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [3, 100] }
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  theatre_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  theatre_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  total_screens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'theatre_owner'
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'theatre_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = TheatreUser;
