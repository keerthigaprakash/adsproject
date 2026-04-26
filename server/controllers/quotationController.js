const Quotation = require('../models/Quotation');
const Ad = require('../models/Ad');

exports.createQuotation = async (req, res) => {
  const { ad_id, base_price, gst_amount, total_amount, commission_amount } = req.body;
  try {
    const quotation = await Quotation.create({
      ad_id,
      agent_id: req.user.id,
      base_price,
      gst_amount,
      total_amount,
      commission_amount
    });
    res.json(quotation);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getAgentQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.findAll({
      where: { agent_id: req.user.id },
      include: [{ model: Ad, attributes: ['title'] }],
      order: [['created_at', 'DESC']]
    });
    
    const formatted = quotations.map(q => ({
      ...q.toJSON(),
      ad_title: q.Ad?.title
    }));
    
    res.json(formatted);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
