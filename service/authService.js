const jwt = require('jsonwebtoken');
const secretKey = '2T$Kj9&rL#pZvG$N6YwDQpM@Xn%R*UvA'; // Replace with your secret key

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(token.replace('Bearer ', ''), secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = {
  authenticateToken,
};