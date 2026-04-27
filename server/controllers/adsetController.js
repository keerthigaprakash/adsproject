const AdSet = require('../models/AdSet');

exports.createAdSet = async (req, res) => {
  try {
    const adSet = await AdSet.create(req.body);
    res.json(adSet);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAdSets = async (req, res) => {
  try {
    const { campaign_id } = req.query;
    const where = campaign_id ? { campaign_id } : {};
    const adSets = await AdSet.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(adSets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAdSetById = async (req, res) => {
  try {
    const adSet = await AdSet.findByPk(req.params.id);
    if (!adSet) return res.status(404).json({ message: 'AdSet not found' });
    res.json(adSet);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateAdSet = async (req, res) => {
  try {
    const adSet = await AdSet.findByPk(req.params.id);
    if (!adSet) return res.status(404).json({ message: 'AdSet not found' });
    
    await adSet.update(req.body);
    res.json(adSet);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
