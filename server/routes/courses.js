const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Helper function to add chapter count to courses
function addChapterCount(course) {
  const chapters = query.getChaptersByCourse(course.id);
  return { ...course, chapters: chapters.length };
}

// Get all courses
router.get('/', (req, res) => {
  const courses = query.getAllCourses();
  // Add chapter count to each course
  const coursesWithCounts = courses.map(addChapterCount);
  res.json(coursesWithCounts);
});

// Get single course
router.get('/:id', (req, res) => {
  const course = query.getCourse(req.params.id);
  if (course) {
    const courseWithCount = addChapterCount(course);
    res.json(courseWithCount);
  } else {
    res.json({});
  }
});

// Create course (Admin only)
router.post('/', (req, res) => {
  const { title, description, cover_image } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const course = query.createCourse(title, description, cover_image);
  res.json(course);
});

// Update course (Admin only)
router.put('/:id', (req, res) => {
  const { title, description, cover_image } = req.body;
  const success = query.updateCourse(req.params.id, title, description, cover_image);
  
  if (success) {
    res.json({ success: true, id: req.params.id });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Delete course (Admin only)
router.delete('/:id', (req, res) => {
  const success = query.deleteCourse(req.params.id);
  
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

module.exports = router;
