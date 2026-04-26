const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/authMiddleware');

router.get('/admins', auth, checkRole(['Super Admin']), async (req, res) => {
  try {
    const admins = await User.findAll({ 
      where: { role: 'Admin' },
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(admins);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
