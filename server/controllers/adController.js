const Ad = require('../models/Ad');

exports.createAd = async (req, res) => {
  const { title, description, price, gst, commission, image, ad_type, budget, video_url, cta_text, status, adset_id } = req.body;
  try {
    console.log('[Ad Create] ── Received body:', req.body);
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
      remaining_budget: budget || 0,
      video_url,
      cta_text: cta_text || 'Learn More',
      status: status || 'Active',
      adset_id
    });
    console.log('[Ad Create] ✅ Successfully saved to DB:', ad.toJSON());
    res.json(ad);
  } catch (err) {
    console.error('[Ad Create] ❌ Error:', err);
    res.status(500).send('Server error');
  }
};

exports.getAds = async (req, res) => {
  try {
    const { status, search, adset_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (adset_id) where.adset_id = adset_id;
    if (search) {
      const { Op } = require('sequelize');
      where.title = { [Op.iLike]: `%${search}%` };
    }

    const ads = await Ad.findAll({
      where,
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

exports.incrementViews = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    
    if (ad.status && ad.status.toLowerCase() !== 'active') {
      return res.json(ad);
    }

    ad.views_count = (ad.views_count || 0) + 1;
    ad.remaining_budget = Math.max(0, (parseFloat(ad.remaining_budget) || 0) - 0.5);

    if (ad.remaining_budget <= 0) {
      ad.status = 'Paused';
    }

    console.log(`[View Tracking] Ad ID: ${ad.id}, Title: ${ad.title}`);
    console.log(`[View Tracking] Updated Views: ${ad.views_count}, Remaining Budget: ${ad.remaining_budget}`);

    await ad.save();
    res.json(ad);
  } catch (err) {
    console.error('Error incrementing views:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.incrementClicks = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    
    if (ad.status && ad.status.toLowerCase() !== 'active') {
      return res.json(ad);
    }

    ad.clicks_count = (ad.clicks_count || 0) + 1;
    ad.remaining_budget = Math.max(0, (parseFloat(ad.remaining_budget) || 0) - 2.0);

    if (ad.remaining_budget <= 0) {
      ad.status = 'Paused';
    }

    console.log(`[Click Tracking] Ad ID: ${ad.id}, Title: ${ad.title}`);
    console.log(`[Click Tracking] Updated Clicks: ${ad.clicks_count}, Remaining Budget: ${ad.remaining_budget}`);

    await ad.save();
    res.json(ad);
  } catch (err) {
    console.error('Error incrementing clicks:', err);
    res.status(500).json({ message: 'Server error' });
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
