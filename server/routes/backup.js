const express = require('express');
const { query, db } = require('../config/database');
const router = express.Router();

// Export database as JSON
router.get('/export', (req, res) => {
  try {
    // Send the entire database as a downloadable file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="database-backup.json"');
    res.json(query.getAllData ? query.getAllData() : { message: 'Database export not available' });
  } catch (error) {
    console.error('Error exporting database:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Get database status
router.get('/status', (req, res) => {
  try {
    const courses = query.getAllCourses();
    const chapters = query.getAllChapters();
    res.json({
      status: 'ok',
      coursesCount: courses.length,
      chaptersCount: chapters.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Status check failed', message: error.message });
  }
});

module.exports = router;
