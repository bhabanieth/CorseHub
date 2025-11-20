const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get chapter versions
router.get('/chapter/:chapterId', (req, res) => {
  const versions = query.getChapterVersions(req.params.chapterId);
  res.json(versions);
});

// Create version (when chapter is updated)
router.post('/', (req, res) => {
  const { chapterId, title, content, versionNote } = req.body;
  
  if (!chapterId) {
    return res.status(400).json({ error: 'Chapter ID is required' });
  }
  
  const version = query.createVersion(chapterId, title, content, versionNote);
  res.json(version);
});

// Restore to previous version
router.post('/restore/:versionId', (req, res) => {
  const success = query.restoreVersion(req.params.versionId);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Version not found' });
  }
});

module.exports = router;
