function checkAdmin(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Simple token verification (in production, use JWT)
  if (token === 'Bearer admin_token') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
}

module.exports = { checkAdmin };
