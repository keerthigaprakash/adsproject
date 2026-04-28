const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Wallet = sequelize.define('Wallet', {
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: 'wallets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

const Transaction = sequelize.define('Transaction', {
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'credit', 'debit'
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Wallet.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Wallet, { foreignKey: 'user_id' });

Transaction.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Transaction, { foreignKey: 'user_id' });

module.exports = { Wallet, Transaction };
