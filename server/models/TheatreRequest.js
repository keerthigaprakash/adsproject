const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TheatreRequest = sequelize.define('TheatreRequest', {
  theatre_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ad_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ad_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ad_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  offer_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  offer_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_screens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  selected_screens: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  selected_screen_details: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 'admin' or 'agent' — who the request is directed to
  request_type: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  theatre_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Response fields filled in by Admin/Agent
  response_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responded_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Pricing breakdown
  gst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'theatre_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const TheatreUser = require('./TheatreUser');
const Ad = require('./Ad');

TheatreRequest.belongsTo(TheatreUser, { as: 'theatre', foreignKey: 'theatre_user_id' });
TheatreUser.hasMany(TheatreRequest, { foreignKey: 'theatre_user_id' });

TheatreRequest.belongsTo(Ad, { as: 'ad', foreignKey: 'ad_id' });
Ad.hasMany(TheatreRequest, { foreignKey: 'ad_id' });

module.exports = TheatreRequest;
