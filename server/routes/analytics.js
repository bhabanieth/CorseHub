const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Track course view
router.post('/track/:courseId', (req, res) => {
  query.trackCourseView(req.params.courseId);
  res.json({ success: true });
});

// Get course analytics
router.get('/course/:courseId', (req, res) => {
  const analytics = query.getAnalytics(req.params.courseId);
  res.json(analytics || []);
});

// Get all analytics
router.get('/', (req, res) => {
  const analytics = query.getAnalytics();
  res.json(analytics || []);
});

module.exports = router;
