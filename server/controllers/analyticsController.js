const { sequelize } = require('../config/db');
const Ad = require('../models/Ad');
const Request = require('../models/Request');
const User = require('../models/User');
const { Wallet } = require('../models/Finance');

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
      const totalViews = await Ad.sum('views') || 0;
      const totalClicks = await Ad.sum('clicks') || 0;
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
