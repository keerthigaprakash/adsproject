const jwt = require('jsonwebtoken');

const theatreAuth = (req, res, next) => {
  const token = req.header('x-theatre-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'theatre_user')
      return res.status(403).json({ message: 'Invalid token type' });
    req.theatreUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { theatreAuth };
