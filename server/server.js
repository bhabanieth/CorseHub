const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'https://corsehub.onrender.com'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Initialize database
db.initDB();

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const chapterRoutes = require('./routes/chapters');
const announcementRoutes = require('./routes/announcements');
const analyticsRoutes = require('./routes/analytics');
const versionsRoutes = require('./routes/versions');
const backupRoutes = require('./routes/backup');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/versions', versionsRoutes);
app.use('/api/backup', backupRoutes);

// Serve static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
