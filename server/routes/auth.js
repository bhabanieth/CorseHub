const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = query.adminLogin(username, password);
  
  if (user) {
    res.json({ 
      success: true, 
      token: 'admin_token',
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
