const Ad = require('../models/Ad');

exports.createAd = async (req, res) => {
  const { title, description, price, gst, commission, image, ad_type, budget, video_url, cta_text, status } = req.body;
  try {
    const ad = await Ad.create({
      creator_id: req.user.id,
      title,
      description,
      price,
      gst,
      commission,
      image,
      ad_type: ad_type || 'banner',
      budget: budget || 0,
      video_url,
      cta_text: cta_text || 'Learn More',
      status: status || 'active'
    });
    res.json(ad);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(ads);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.json(ad);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.trackActivity = async (req, res) => {
  const { type } = req.body; // 'view' or 'click'
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });

    if (type === 'view') {
      ad.views += 1;
    } else if (type === 'click') {
      ad.clicks += 1;
    }
    
    await ad.save();
    res.json(ad);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    
    await ad.destroy();
    res.json({ message: 'Ad deleted successfully' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
