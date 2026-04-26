const { Wallet, Transaction } = require('../models/Finance');

exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) {
      wallet = await Wallet.create({ user_id: req.user.id, balance: 0 });
    }
    res.json(wallet);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const txs = await Transaction.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(txs);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
