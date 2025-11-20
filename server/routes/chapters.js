const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get chapters for a course
router.get('/course/:courseId', (req, res) => {
  const chapters = query.getChaptersByCourse(req.params.courseId);
  res.json(chapters);
});

// Get single chapter
router.get('/:id', (req, res) => {
  const chapter = query.getChapter(req.params.id);
  res.json(chapter || {});
});

// Create chapter (Admin only)
router.post('/', (req, res) => {
  const { course_id, title, content, order_index } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: 'Course ID and title are required' });
  }

  const chapter = query.createChapter(course_id, title, content, order_index);
  res.json(chapter);
});

// Update chapter (Admin only)
router.put('/:id', (req, res) => {
  const { title, content, order_index } = req.body;
  const success = query.updateChapter(req.params.id, title, content, order_index);
  
  if (success) {
    res.json({ success: true, id: req.params.id });
  } else {
    res.status(404).json({ error: 'Chapter not found' });
  }
});

// Delete chapter (Admin only)
router.delete('/:id', (req, res) => {
  const success = query.deleteChapter(req.params.id);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Chapter not found' });
  }
});

module.exports = router;
