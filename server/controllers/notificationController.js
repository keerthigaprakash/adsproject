const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    notification.is_read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
