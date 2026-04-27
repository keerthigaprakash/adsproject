const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Campaign = sequelize.define('Campaign', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  objective: {
    type: DataTypes.STRING, // awareness, traffic, sales
    defaultValue: 'traffic'
  },
  status: {
    type: DataTypes.STRING, // Active, Paused, Completed
    defaultValue: 'Active'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Campaign.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
User.hasMany(Campaign, { foreignKey: 'creator_id' });

module.exports = Campaign;
