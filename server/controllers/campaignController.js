const Campaign = require('../models/Campaign');

exports.createCampaign = async (req, res) => {
  try {
    console.log('[Campaign Create] ── Received body:', req.body);
    const campaign = await Campaign.create({
      ...req.body,
      creator_id: req.user.id
    });
    console.log('[Campaign Create] ✅ Successfully saved to DB:', campaign.toJSON());
    res.json(campaign);
  } catch (err) {
    console.error('[Campaign Create] ❌ Error:', err);
    res.status(500).send('Server error');
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({ order: [['created_at', 'DESC']] });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    
    await campaign.update(req.body);
    res.json(campaign);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
