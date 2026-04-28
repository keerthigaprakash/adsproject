const TheatreRequest = require('../models/TheatreRequest');

// Theatre user submits a new ad request (to Admin or Agent)
exports.createRequest = async (req, res) => {
  const { ad_id, ad_title, ad_price, request_type, theatre_notes, selected_screens, selectedScreens, selected_screen_details, offer_price, offer_reason } = req.body;
  const sScreens = selected_screens || selectedScreens;

  try {
    if (!ad_title || !ad_price || !sScreens || !offer_price || !offer_reason)
      return res.status(400).json({ message: 'Ad title, original price, selected screens, offer price, and reason are required' });

    if (parseFloat(offer_price) > parseFloat(ad_price)) {
      return res.status(400).json({ message: 'Offer price cannot exceed the original admin price' });
    }

    // Fetch user to get total_screens
    const TheatreUser = require('../models/TheatreUser');
    const user = await TheatreUser.findByPk(req.theatreUser.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (parseInt(sScreens) > user.total_screens) {
      return res.status(400).json({ message: `Cannot select ${sScreens} screens. Only ${user.total_screens} available.` });
    }

    const priceToUse        = parseFloat(offer_price);
    const gst_amount        = priceToUse * 0.18;
    const commission_amount = priceToUse * 0.10;
    const total_amount      = priceToUse + gst_amount;

    console.log('[Theatre Request] ── Received body:', req.body);
    const request = await TheatreRequest.create({
      theatre_user_id:  req.theatreUser.id,
      ad_id:            ad_id || null,
      ad_title,
      ad_price,
      offer_price:      priceToUse,
      offer_reason:     offer_reason,
      total_screens:    user.total_screens,
      selected_screens: parseInt(sScreens),
      selected_screen_details: selected_screen_details || Array.from({ length: parseInt(sScreens) }, (_, i) => `Screen ${i + 1}`).join(', '),
      request_type:     request_type || 'admin',
      theatre_notes:    theatre_notes || '',
      gst_amount,
      commission_amount,
      total_amount,
      status: 'pending'
    });

    console.log('[Theatre Request] ✅ Request successfully saved to Database:', request.toJSON());
    res.json(request);
  } catch (err) {
    console.error('Create theatre request error:', err);
    res.status(500).send('Server error');
  }
};

// Theatre user fetches all their own requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await TheatreRequest.findAll({
      where: { theatre_user_id: req.theatreUser.id },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Theatre user fetches only agent-type responses
exports.getAgentResponses = async (req, res) => {
  try {
    const requests = await TheatreRequest.findAll({
      where: { theatre_user_id: req.theatreUser.id, request_type: 'agent' },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Theatre user fetches only admin-type responses
exports.getAdminResponses = async (req, res) => {
  try {
    const requests = await TheatreRequest.findAll({
      where: { theatre_user_id: req.theatreUser.id, request_type: 'admin' },
      order: [['created_at', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Admin or Agent responds to a theatre request
exports.respondToRequest = async (req, res) => {
  const { id } = req.params;
  const { status, response_message } = req.body;
  try {
    const request = await TheatreRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status           = status || request.status;
    request.response_message = response_message || '';
    request.responded_by     = req.user?.name || req.user?.role || 'Admin';
    request.responded_at     = new Date();
    await request.save();

    res.json(request);
  } catch (err) {
    console.error('Respond to theatre request error:', err);
    res.status(500).send('Server error');
  }
};

// Admin / Agent — list ALL theatre requests, enriched with Theatre Owner details
exports.getAllTheatreRequests = async (req, res) => {
  try {
    const TheatreUser = require('../models/TheatreUser');

    // Agents only see their own type; Admin/Super Admin see everything
    const where = {};
    if (req.user?.role === 'Agent') where.request_type = 'agent';

    const requests = await TheatreRequest.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Merge theatre owner details into each request
    const ids   = [...new Set(requests.map(r => r.theatre_user_id))];
    const users = await TheatreUser.findAll({
      where: { id: ids },
      attributes: ['id', 'username', 'email', 'theatre_name', 'theatre_address']
    });
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.toJSON(); });

    const result = requests.map(r => ({
      ...r.toJSON(),
      theatre_owner: userMap[r.theatre_user_id] || {}
    }));

    res.json(result);
  } catch (err) {
    console.error('getAllTheatreRequests error:', err);
    res.status(500).send('Server error');
  }
};
