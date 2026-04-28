const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Ad = require('./Ad');
const User = require('./User');

const Quotation = sequelize.define('Quotation', {
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gst_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'quotations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Quotation.belongsTo(Ad, { foreignKey: 'ad_id' });
Quotation.belongsTo(User, { as: 'agent', foreignKey: 'agent_id' });

module.exports = Quotation;
