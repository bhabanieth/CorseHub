const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get active announcements
router.get('/', (req, res) => {
  const announcements = query.getActiveAnnouncements();
  res.json(announcements);
});

// Get all announcements (Admin)
router.get('/admin/all', (req, res) => {
  const announcements = query.getAllAnnouncements();
  res.json(announcements);
});

// Create announcement (Admin only)
router.post('/', (req, res) => {
  const { title, content, expires_at } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const announcement = query.createAnnouncement(title, content, expires_at);
  res.json(announcement);
});

// Update announcement (Admin only)
router.put('/:id', (req, res) => {
  const { title, content, is_active, expires_at } = req.body;
  const success = query.updateAnnouncement(req.params.id, title, content, is_active, expires_at);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Announcement not found' });
  }
});

// Delete announcement (Admin only)
router.delete('/:id', (req, res) => {
  const success = query.deleteAnnouncement(req.params.id);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Announcement not found' });
  }
});

module.exports = router;
