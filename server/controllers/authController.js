const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Wallet } = require('../models/Finance');

// ── Whitelist of emails that are permitted to log in as Agent ──────────────────
const ALLOWED_AGENTS = new Set([
  'ravi@gmail.com',
  'kavitha@gmail.com',
  'keerthi@gmail.com',
  'mani@gmail.com',
  'magi@gmail.com',
  'sri@gmail.com',
]);

// Public registration is disabled — agents are seeded, admins are created manually.
exports.register = async (req, res) => {
  return res.status(403).json({ message: 'Self-registration is not allowed. Contact your administrator.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    // Generic "Invalid credentials" for all failure paths to prevent enumeration
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Agent whitelist enforcement — only the 6 approved agents may log in
    if (user.role === 'Agent' && !ALLOWED_AGENTS.has(email.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'avatar']
    });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

