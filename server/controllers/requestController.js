const Request = require('../models/Request');
const Ad = require('../models/Ad');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  const { ad_id, ad_title, ad_price } = req.body;
  try {
    const request = await Request.create({
      ad_id,
      agent_id: req.user.id,
      ad_title: ad_title || null,
      ad_price: ad_price || null
    });
    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      include: [
        { model: Ad, attributes: ['title', 'price'] },
        { model: User, as: 'agent', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // Format response to match previous flat structure if needed by frontend
    const formatted = requests.map(r => ({
      id: r.id,
      ad_id: r.ad_id,
      agent_id: r.agent_id,
      status: r.status,
      created_at: r.created_at,
      title: r.Ad?.title || r.ad_title || `Ad #${r.ad_id}`,
      price: r.Ad?.price || r.ad_price || 0,
      agent_name: r.agent?.name || 'Agent'
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    await request.save();

    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user_id: request.agent_id,
        message: `Your request for Ad ID ${request.ad_id} has been ${status}.`
      });
      // also change the ad status if approved/rejected?
      if (status === 'approved' || status === 'rejected') {
         const ad = await Ad.findByPk(request.ad_id);
         if (ad) {
           ad.status = status === 'approved' ? 'Active' : 'Rejected';
           await ad.save();
         }
      }
    } catch(e) {}

    res.json(request);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getApprovedAds = async (req, res) => {
  try {
    const requests = await Request.findAll({
      where: { agent_id: req.user.id, status: 'approved' },
      include: [{ model: Ad }]
    });
    res.json(requests.map(r => r.Ad));
  } catch (err) {
    res.status(500).send('Server error');
  }
};

