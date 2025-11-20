const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../db/database.json');
const dbDir = path.join(__dirname, '../db');

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Default database structure
const defaultDB = {
  admin: [
    { id: 1, username: 'admin', password: 'admin@123', created_at: new Date().toISOString() }
  ],
  courses: [],
  chapters: [],
  announcements: []
};

// Load or initialize database
let db = defaultDB;

function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      db = JSON.parse(data);
    } else {
      saveDB();
    }
  } catch (error) {
    console.error('Error loading database:', error);
    db = defaultDB;
    saveDB();
  }
}

function saveDB() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function initDB() {
  loadDB();
  console.log('Database initialized successfully');
}

// Database query methods
const query = {
  // Admin queries
  adminLogin: (username, password) => {
    return db.admin.find(a => a.username === username && a.password === password);
  },

  // Course queries
  getAllCourses: () => {
    return db.courses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  getCourse: (id) => {
    return db.courses.find(c => c.id == id);
  },
  
  createCourse: (title, description, cover_image) => {
    const course = {
      id: Date.now(),
      title,
      description,
      cover_image,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.courses.push(course);
    saveDB();
    return course;
  },
  
  updateCourse: (id, title, description, cover_image) => {
    const course = db.courses.find(c => c.id == id);
    if (course) {
      course.title = title;
      course.description = description;
      course.cover_image = cover_image;
      course.updated_at = new Date().toISOString();
      saveDB();
      return true;
    }
    return false;
  },
  
  deleteCourse: (id) => {
    const index = db.courses.findIndex(c => c.id == id);
    if (index !== -1) {
      db.courses.splice(index, 1);
      // Delete associated chapters
      db.chapters = db.chapters.filter(ch => ch.course_id != id);
      saveDB();
      return true;
    }
    return false;
  },

  // Chapter queries
  getChaptersByCourse: (courseId) => {
    return db.chapters
      .filter(ch => ch.course_id == courseId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },
  
  getChapter: (id) => {
    return db.chapters.find(ch => ch.id == id);
  },
  
  createChapter: (course_id, title, content, order_index) => {
    const chapter = {
      id: Date.now(),
      course_id,
      title,
      content,
      order_index: order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.chapters.push(chapter);
    saveDB();
    return chapter;
  },
  
  updateChapter: (id, title, content, order_index) => {
    const chapter = db.chapters.find(ch => ch.id == id);
    if (chapter) {
      chapter.title = title;
      chapter.content = content;
      chapter.order_index = order_index;
      chapter.updated_at = new Date().toISOString();
      saveDB();
      return true;
    }
    return false;
  },
  
  deleteChapter: (id) => {
    const index = db.chapters.findIndex(ch => ch.id == id);
    if (index !== -1) {
      db.chapters.splice(index, 1);
      saveDB();
      return true;
    }
    return false;
  },

  // Announcement queries
  getActiveAnnouncements: () => {
    return db.announcements
      .filter(a => a.is_active)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  getAllAnnouncements: () => {
    return db.announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  createAnnouncement: (title, content, expires_at) => {
    const announcement = {
      id: Date.now(),
      title,
      content,
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: expires_at || null
    };
    db.announcements.push(announcement);
    saveDB();
    return announcement;
  },
  
  updateAnnouncement: (id, title, content, is_active, expires_at) => {
    const announcement = db.announcements.find(a => a.id == id);
    if (announcement) {
      announcement.title = title;
      announcement.content = content;
      announcement.is_active = is_active;
      announcement.expires_at = expires_at;
      saveDB();
      return true;
    }
    return false;
  },
  
  deleteAnnouncement: (id) => {
    const index = db.announcements.findIndex(a => a.id == id);
    if (index !== -1) {
      db.announcements.splice(index, 1);
      saveDB();
      return true;
    }
    return false;
  }
};

module.exports = {
  initDB,
  query,
  saveDB,
  loadDB
};
