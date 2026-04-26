const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Ad = require('./Ad');
const User = require('./User');

const Request = sequelize.define('Request', {
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relationships
Request.belongsTo(Ad, { foreignKey: 'ad_id' });
Request.belongsTo(User, { as: 'agent', foreignKey: 'agent_id' });
Ad.hasMany(Request, { foreignKey: 'ad_id' });
User.hasMany(Request, { foreignKey: 'agent_id' });

module.exports = Request;
