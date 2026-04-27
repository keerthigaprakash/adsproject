const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Campaign = require('./Campaign');

const AdSet = sequelize.define('AdSet', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targeting: {
    type: DataTypes.JSONB, // { age_min, age_max, location: {city, state, country}, interests: [] }
    defaultValue: {}
  },
  daily_budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  total_budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  spent_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING, // Active, exhausted, Paused, Completed
    defaultValue: 'Active'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

AdSet.belongsTo(Campaign, { foreignKey: 'campaign_id' });
Campaign.hasMany(AdSet, { foreignKey: 'campaign_id' });

module.exports = AdSet;
