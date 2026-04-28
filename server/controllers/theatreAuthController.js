const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TheatreUser = require('../models/TheatreUser');

// POST /api/theatre/register
exports.register = async (req, res) => {
  console.log('[Theatre Register] ── Received body:', { ...req.body, password: '***' });
  const { username, email, theatre_name, theatreName, theatre_address, theatreAddress, total_screens, totalScreens, password } = req.body;

  const tName     = theatre_name    || theatreName;
  const tAddress  = theatre_address || theatreAddress;
  const tScreens  = total_screens   || totalScreens;

  try {
    if (!username || !email || !tName || !tAddress || !tScreens || !password) {
      console.log('[Theatre Register] ❌ Missing fields:', { username: !!username, email: !!email, tName: !!tName, tAddress: !!tAddress, tScreens: !!tScreens, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (username.trim().length < 3)
      return res.status(400).json({ message: 'Username must be at least 3 characters' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await TheatreUser.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      console.log('[Theatre Register] ❌ Email exists:', email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await TheatreUser.create({
      username:        username.trim(),
      email:           email.toLowerCase().trim(),
      theatre_name:    tName.trim(),
      theatre_address: tAddress.trim(),
      total_screens:   parseInt(tScreens),
      password:        hashedPassword,
      role:            'theatre_owner'
    });

    console.log('[Theatre Register] ✅ Data successfully saved to Database:', newUser.toJSON());

    // Auto-login: return token so frontend can redirect immediately
    const token = jwt.sign(
      { id: newUser.id, type: 'theatre_user', role: 'theatre_owner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Theatre Register] ✅ Registered & token issued: ${email.toLowerCase().trim()}`);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id:              newUser.id,
        username:        newUser.username,
        email:           newUser.email,
        theatre_name:    newUser.theatre_name,
        theatre_address: newUser.theatre_address,
        total_screens:   newUser.total_screens,
        role:            'theatre_owner',
        type:            'theatre_user'
      }
    });

  } catch (err) {
    console.error('[Theatre Register] ❌ CRITICAL ERROR:', err);
    if (err.name === 'SequelizeUniqueConstraintError')
      return res.status(400).json({ message: 'Email already registered' });
    if (err.name === 'SequelizeValidationError')
      return res.status(400).json({ message: err.errors[0]?.message || 'Validation error' });
    res.status(500).json({ message: `Registration failed: ${err.message}` });
  }
};

// POST /api/theatre/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const searchEmail = (email || '').toLowerCase().trim();

  console.log(`\n[Theatre Login] ── Attempt: ${searchEmail}`);

  try {
    if (!searchEmail || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await TheatreUser.findOne({ where: { email: searchEmail } });

    if (!user) {
      console.log(`[Theatre Login] ❌ No account found for: ${searchEmail}`);
      // List all emails in DB for debugging
      const allUsers = await TheatreUser.findAll({ attributes: ['email', 'role'] });
      console.log('[Theatre Login] Existing theatre users:', allUsers.map(u => `${u.email} (${u.role})`));
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`[Theatre Login] ✅ Found user: ${user.username}, role: "${user.role}"`);

    // Accept 'theatre_owner', 'Theatre Owner', or NULL (legacy)
    const role = (user.role || 'theatre_owner').toLowerCase().replace(/\s+/g, '_');
    if (role !== 'theatre_owner') {
      console.log(`[Theatre Login] ❌ Role blocked: "${user.role}"`);
      return res.status(403).json({ message: 'Access denied. This portal is for Theatre Owners only.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[Theatre Login] Password match: ${isMatch}`);

    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Fix role in DB if it was NULL
    if (!user.role) {
      await user.update({ role: 'theatre_owner' });
    }

    const token = jwt.sign(
      { id: user.id, type: 'theatre_user', role: 'theatre_owner' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Theatre Login] ✅ Login successful: ${user.email}`);
    res.json({
      token,
      user: {
        id:              user.id,
        username:        user.username,
        email:           user.email,
        theatre_name:    user.theatre_name,
        theatre_address: user.theatre_address,
        role:            user.role || 'theatre_owner',
        type:            'theatre_user'
      }
    });
  } catch (err) {
    console.error('[Theatre Login] ❌ Server error:', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// GET /api/theatre/me
exports.getMe = async (req, res) => {
  try {
    const user = await TheatreUser.findByPk(req.theatreUser.id, {
      attributes: ['id', 'username', 'email', 'theatre_name', 'theatre_address', 'role', 'created_at']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user.toJSON(), type: 'theatre_user' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/theatre/debug-check?email=xxx  — TEMPORARY DEBUG ONLY
exports.debugCheck = async (req, res) => {
  try {
    const { email } = req.query;
    const allUsers = await TheatreUser.findAll({
      attributes: ['id', 'username', 'email', 'role', 'created_at']
    });
    const found = email
      ? allUsers.filter(u => u.email === email.toLowerCase().trim())
      : allUsers;
    res.json({ total: allUsers.length, results: found });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
