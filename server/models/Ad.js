const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Ad = sequelize.define('Ad', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  gst: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  commission: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active' // Active, Paused, Completed, Rejected
  },
  ad_type: {
    type: DataTypes.STRING,
    defaultValue: 'banner' // 'banner' or 'video'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  remaining_budget: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  video_url: {
    type: DataTypes.TEXT
  },
  cta_text: {
    type: DataTypes.STRING,
    defaultValue: 'Learn More'
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  image: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'ads',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relationships
const AdSet = require('./AdSet');

Ad.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
User.hasMany(Ad, { foreignKey: 'creator_id' });

Ad.belongsTo(AdSet, { foreignKey: 'adset_id' });
AdSet.hasMany(Ad, { foreignKey: 'adset_id' });

module.exports = Ad;
