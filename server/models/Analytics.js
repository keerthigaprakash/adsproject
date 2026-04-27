const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Ad = require('./Ad');

const Analytics = sequelize.define('Analytics', {
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  spend: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Analytics.belongsTo(Ad, { foreignKey: 'ad_id' });
Ad.hasMany(Analytics, { foreignKey: 'ad_id' });

module.exports = Analytics;
