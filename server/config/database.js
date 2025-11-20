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
    { id: 1, username: 'bhabani_admin', password: 'K7@mPx#9qR2$vL8nW4', created_at: new Date().toISOString() }
  ],
  courses: [],
  chapters: [],
  announcements: [],
  analytics: [],  // Track course views and engagement
  courseVersions: []  // Track chapter changes/versions
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
    loadDB(); // Reload before read
    return db.admin.find(a => a.username === username && a.password === password);
  },

  // Course queries
  getAllCourses: () => {
    loadDB(); // Reload before read
    return db.courses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  getCourse: (id) => {
    loadDB(); // Reload before read
    return db.courses.find(c => c.id == id);
  },
  
  createCourse: (title, description, cover_image, difficulty = 'Beginner') => {
    loadDB(); // Reload before write
    const course = {
      id: Date.now(),
      title,
      description,
      cover_image,
      difficulty,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.courses.push(course);
    saveDB();
    return course;
  },
  
  updateCourse: (id, title, description, cover_image, difficulty = 'Beginner') => {
    loadDB(); // Reload before write
    const course = db.courses.find(c => c.id == id);
    if (course) {
      course.title = title;
      course.description = description;
      course.cover_image = cover_image;
      course.difficulty = difficulty;
      course.updated_at = new Date().toISOString();
      saveDB();
      return true;
    }
    return false;
  },
  
  deleteCourse: (id) => {
    loadDB(); // Reload before write
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
    loadDB(); // Reload before read
    return db.chapters
      .filter(ch => ch.course_id == courseId)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  },
  
  getChapter: (id) => {
    loadDB(); // Reload before read
    return db.chapters.find(ch => ch.id == id);
  },
  
  createChapter: (course_id, title, content, order_index) => {
    loadDB(); // Reload before write
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
    loadDB(); // Reload before write
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
    loadDB(); // Reload before write
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
    loadDB(); // Reload before read
    return db.announcements
      .filter(a => a.is_active)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  getAllAnnouncements: () => {
    loadDB(); // Reload before read
    return db.announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  
  createAnnouncement: (title, content, expires_at) => {
    loadDB(); // Reload before write
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
    loadDB(); // Reload before write
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
    loadDB(); // Reload before write
    const index = db.announcements.findIndex(a => a.id == id);
    if (index !== -1) {
      db.announcements.splice(index, 1);
      saveDB();
      return true;
    }
    return false;
  },

  // Analytics queries
  trackCourseView: (courseId) => {
    loadDB();
    const existingView = db.analytics.find(a => a.courseId == courseId && a.type === 'view');
    if (existingView) {
      existingView.count = (existingView.count || 0) + 1;
      existingView.lastViewed = new Date().toISOString();
    } else {
      db.analytics.push({
        id: Date.now(),
        courseId,
        type: 'view',
        count: 1,
        lastViewed: new Date().toISOString()
      });
    }
    saveDB();
  },

  getAnalytics: (courseId) => {
    loadDB();
    if (courseId) {
      return db.analytics.filter(a => a.courseId == courseId);
    }
    return db.analytics;
  },

  // Versioning queries
  createVersion: (chapterId, title, content, versionNote = '') => {
    loadDB();
    const version = {
      id: Date.now(),
      chapterId,
      title,
      content,
      versionNote,
      createdAt: new Date().toISOString()
    };
    if (!db.courseVersions) db.courseVersions = [];
    db.courseVersions.push(version);
    saveDB();
    return version;
  },

  getChapterVersions: (chapterId) => {
    loadDB();
    if (!db.courseVersions) return [];
    return db.courseVersions
      .filter(v => v.chapterId == chapterId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  restoreVersion: (versionId) => {
    loadDB();
    const version = db.courseVersions.find(v => v.id == versionId);
    if (version) {
      const chapter = db.chapters.find(ch => ch.id == version.chapterId);
      if (chapter) {
        chapter.content = version.content;
        chapter.title = version.title;
        chapter.updated_at = new Date().toISOString();
        saveDB();
        return true;
      }
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
