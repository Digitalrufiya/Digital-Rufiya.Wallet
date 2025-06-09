import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your_super_secret_key'; // Move this to .env in production

// Generate Token
function generateToken(user) {
  return jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
}

// Verify Token Middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
