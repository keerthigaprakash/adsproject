const { sequelize } = require('../config/db');
const Ad = require('../models/Ad');
const Request = require('../models/Request');
const User = require('../models/User');
const { Wallet } = require('../models/Finance');
const Analytics = require('../models/Analytics');
const TheatreRequest = require('../models/TheatreRequest');
const TheatreUser = require('../models/TheatreUser');

exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'Agent') {
      const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
      const approvedCount = await Request.count({ where: { agent_id: req.user.id, status: 'approved' } });
      const totalCampaigns = await Request.count({ where: { agent_id: req.user.id } });
      
      const recentActivity = await Request.findAll({
        where: { agent_id: req.user.id },
        include: [{ model: Ad, attributes: ['title'] }],
        limit: 5,
        order: [['created_at', 'DESC']]
      });

      res.json({
        earnings: wallet?.balance || 0,
        activePermissions: approvedCount,
        totalCampaigns: totalCampaigns,
        recentActivity: recentActivity.map(r => ({
          status: r.status,
          title: r.Ad?.title,
          created_at: r.created_at
        }))
      });
    } else {
      const totalAds = await Ad.count();
      const totalViews = await Ad.sum('views_count') || 0;
      const totalClicks = await Ad.sum('clicks_count') || 0;
      const pendingRequests = await Request.count({ where: { status: 'pending' } });
      const totalAgents = await User.count({ where: { role: 'Agent' } });
      
      res.json({
        totalAds,
        totalViews,
        totalClicks,
        pendingRequests,
        totalAgents,
        revenue: 84200, // Still mocked for design, could be summed from transactions
        traffic: 142000,
        bounceRate: 23
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getChartData = async (req, res) => {
  try {
    const data = await Analytics.findAll({
      attributes: [
        'date', 
        [sequelize.fn('sum', sequelize.col('views')), 'total_views'],
        [sequelize.fn('sum', sequelize.col('clicks')), 'total_clicks'],
        [sequelize.fn('sum', sequelize.col('spend')), 'total_spend'],
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      limit: 30
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getReport = async (req, res) => {
  try {
    const { start_date, end_date, format } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    }

    const reportData = await Analytics.findAll({
      where,
      include: [{ model: Ad, attributes: ['title'] }],
      order: [['date', 'DESC']]
    });

    if (format === 'csv') {
      let csv = 'Date,Ad Title,Impressions,Clicks,Views,Spend,CTR,CPC\n';
      reportData.forEach(row => {
        const ctr = row.impressions > 0 ? (row.clicks / row.impressions).toFixed(4) : 0;
        const cpc = row.clicks > 0 ? (row.spend / row.clicks).toFixed(2) : 0;
        const title = row.Ad ? row.Ad.title.replace(/"/g, '""') : '';
        csv += `${row.date},"${title}",${row.impressions},${row.clicks},${row.views},${row.spend},${ctr},${cpc}\n`;
      });
      res.header('Content-Type', 'text/csv');
      res.attachment('report.csv');
      return res.send(csv);
    }
    
    // Add CTR and CPC in json response
    const jsonResp = reportData.map(row => {
      const data = row.toJSON();
      data.ctr = row.impressions > 0 ? (row.clicks / row.impressions).toFixed(4) : 0;
      data.cpc = row.clicks > 0 ? (row.spend / row.clicks).toFixed(2) : 0;
      return data;
    });
    res.json(jsonResp);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAnalyticsGraph = async (req, res) => {
  try {
    const ads = await Ad.findAll();
    const data = ads.map(ad => ({
      name: ad.title,
      views: ad.views_count || 0,
      clicks: ad.clicks_count || 0
    }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getSpendAnalytics = async (req, res) => {
  try {
    // 1. Total Ad Spend
    const totalSpend = await Analytics.sum('spend') || 0;

    // 2. Spend by Agent
    const spendByAgent = await Analytics.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('spend')), 'total_spend']
      ],
      include: [{
        model: Ad,
        attributes: ['creator_id'],
        include: [{
          model: User,
          as: 'creator',
          attributes: ['name']
        }]
      }],
      group: ['Ad.creator_id', 'Ad.creator.id', 'Ad.creator.name'],
      raw: true,
      nest: true
    });

    // 3. Spend by Theatre
    // Using TheatreRequest because Analytics doesn't have theatre_id
    const spendByTheatre = await TheatreRequest.findAll({
      attributes: [
        'theatre_user_id',
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spend']
      ],
      include: [{
        model: TheatreUser,
        as: 'theatre',
        attributes: ['theatre_name']
      }],
      group: ['theatre_user_id', 'theatre.id', 'theatre.theatre_name'],
      raw: true,
      nest: true
    });

    // 4. Spend over Time
    const spendOverTime = await Analytics.findAll({
      attributes: [
        'date',
        [sequelize.fn('SUM', sequelize.col('spend')), 'total_spend']
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      raw: true
    });

    res.json({
      totalSpend,
      spendByAgent: spendByAgent.map(item => ({
        name: item.Ad?.creator?.name || 'Unknown Agent',
        spend: parseFloat(item.total_spend)
      })),
      spendByTheatre: spendByTheatre.map(item => ({
        name: item.theatre?.theatre_name || 'Unknown Theatre',
        spend: parseFloat(item.total_spend)
      })),
      spendOverTime: spendOverTime.map(item => ({
        date: item.date,
        spend: parseFloat(item.total_spend)
      }))
    });
  } catch (err) {
    console.error('Spend Analytics Error:', err);
    res.status(500).json({ error: 'Failed to fetch spend analytics' });
  }
};
