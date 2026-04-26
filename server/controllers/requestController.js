const Request = require('../models/Request');
const Ad = require('../models/Ad');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  const { ad_id } = req.body;
  try {
    const request = await Request.create({
      ad_id,
      agent_id: req.user.id
    });
    res.json(request);
  } catch (err) {
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
      title: r.Ad?.title,
      price: r.Ad?.price,
      agent_name: r.agent?.name
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

