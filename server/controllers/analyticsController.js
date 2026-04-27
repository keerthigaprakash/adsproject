const { sequelize } = require('../config/db');
const Ad = require('../models/Ad');
const Request = require('../models/Request');
const User = require('../models/User');
const { Wallet } = require('../models/Finance');
const Analytics = require('../models/Analytics');

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
