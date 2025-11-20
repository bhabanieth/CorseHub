// Client-side pages

// Pagination settings
const COURSES_PER_PAGE = 6;
let currentPage = 1;

// Get difficulty badge color
function getDifficultyColor(difficulty) {
  const colors = {
    'Beginner': '#00ff88',
    'Intermediate': '#ffa500',
    'Advanced': '#ff006e'
  };
  return colors[difficulty] || '#00d4ff';
}

// Calculate reading time (rough estimate: 200 words per minute)
function calculateReadingTime(content) {
  if (!content) return 0;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200);
}

async function renderClientHome() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '';

  // Fetch announcements and courses with cache busting
  const cacheBuster = `?t=${Date.now()}`;
  const [announcements, courses] = await Promise.all([
    fetch(`${API_BASE}/announcements${cacheBuster}`).then(r => r.json()).catch(() => []),
    fetch(`${API_BASE}/courses${cacheBuster}`).then(r => r.json()).catch(() => [])
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(courses.length / COURSES_PER_PAGE);
  const startIdx = (currentPage - 1) * COURSES_PER_PAGE;
  const paginatedCourses = courses.slice(startIdx, startIdx + COURSES_PER_PAGE);

  mainContent.innerHTML = `
    <!-- Hero Section -->
    <div class="hero">
      <h1><i class="fas fa-graduation-cap"></i> Welcome to CourseShare</h1>
      <p>Explore comprehensive courses and enhance your knowledge</p>
      <div class="hero-buttons">
        <a href="#courses" class="btn-primary">
          <i class="fas fa-book"></i> Browse Courses
        </a>
        <button class="btn-secondary" data-bs-toggle="modal" data-bs-target="#loginModal">
          <i class="fas fa-lock"></i> Admin Access
        </button>
      </div>
    </div>

    <!-- Announcements Section -->
    ${announcements.length > 0 ? `
      <div class="courses-container announcements-section">
        <h2 class="section-title">📢 Latest Announcements</h2>
        <div class="announcements-list">
          ${announcements.map(ann => `
            <div class="announcement-item">
              <div class="announcement-title">${ann.title}</div>
              <div class="announcement-content">${ann.content}</div>
              <div class="announcement-time">
                <i class="fas fa-clock"></i> ${getTimeAgo(ann.created_at)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Courses Section -->
    <div class="courses-container">
      <h2 class="section-title">📚 Available Courses (${courses.length})</h2>
      ${courses.length > 0 ? `
        <div class="courses-grid">
          ${paginatedCourses.map(course => `
            <div class="course-card">
              ${course.cover_image ? `
                <div class="course-cover">
                  <img src="${course.cover_image}" alt="${course.title}" loading="lazy" onerror="this.style.display='none';" style="width: 100%; height: 150px; object-fit: cover;">
                </div>
              ` : `
                <div class="course-header">
                  <div class="course-icon">
                    <i class="fas fa-${getIconForCourse(course.title)}"></i>
                  </div>
                </div>
              `}
              <div style="flex-grow: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div class="course-title">${course.title}</div>
                  <span style="background: ${getDifficultyColor(course.difficulty || 'Beginner')}; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
                    ${course.difficulty || 'Beginner'}
                  </span>
                </div>
                <div class="course-description">${course.description || 'No description available'}</div>
                <div class="course-meta">
                  <span class="course-chapters">
                    <i class="fas fa-list"></i> ${course.chapters || 0} Chapters
                  </span>
                  <span>${formatDate(course.created_at)}</span>
                </div>
              </div>
              <div class="course-actions">
                <button class="btn-small" onclick="trackCourseView(${course.id}); window.location.hash='#course/${course.id}'">
                  <i class="fas fa-eye"></i> View Course
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Pagination -->
        ${totalPages > 1 ? `
          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 40px;">
            ${currentPage > 1 ? `<button class="btn-small" onclick="changePage(${currentPage - 1})" style="padding: 8px 12px;"><i class="fas fa-chevron-left"></i></button>` : ''}
            <div style="display: flex; gap: 5px; align-items: center;">
              ${Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
                <button class="btn-small" onclick="changePage(${page})" style="padding: 8px 12px; background: ${page === currentPage ? 'var(--primary)' : 'var(--glass-bg)'}; color: ${page === currentPage ? 'var(--dark-bg)' : 'var(--light-text)'};">
                  ${page}
                </button>
              `).join('')}
            </div>
            ${currentPage < totalPages ? `<button class="btn-small" onclick="changePage(${currentPage + 1})" style="padding: 8px 12px;"><i class="fas fa-chevron-right"></i></button>` : ''}
          </div>
        ` : ''}
      ` : `
        <div style="text-align: center; padding: 60px 20px; color: var(--light-text-muted);">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; display: block; opacity: 0.5;"></i>
          <p>No courses available yet. Check back soon!</p>
        </div>
      `}
    </div>
  `;
}

function changePage(page) {
  currentPage = page;
  window.location.hash = '#home';
  setTimeout(() => renderClientHome(), 100);
}

async function trackCourseView(courseId) {
  try {
    await fetch(`${API_BASE}/analytics/track/${courseId}`, { method: 'POST' });
  } catch (error) {
    console.log('Analytics tracking:', error);
  }
}

async function renderCoursePage(courseId) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div> Loading course...</div>';

  try {
    const cacheBuster = `?t=${Date.now()}`;
    const [course, chapters] = await Promise.all([
      fetch(`${API_BASE}/courses/${courseId}${cacheBuster}`).then(r => r.json()),
      fetch(`${API_BASE}/chapters/course/${courseId}${cacheBuster}`).then(r => r.json()).catch(() => [])
    ]);

    mainContent.innerHTML = `
      <div class="courses-container">
        <button class="btn-nav" onclick="window.history.back()">
          <i class="fas fa-arrow-left"></i> Back
        </button>

        ${course.cover_image ? `
          <div style="margin: 30px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 30px rgba(0, 212, 255, 0.15);">
            <img src="${course.cover_image}" alt="${course.title}" style="width: 100%; height: auto; max-height: 400px; object-fit: cover; display: block;" onerror="this.style.display='none';">
          </div>
        ` : ''}

        <div class="chapter-header" style="margin-top: 30px;">
          <h1 class="chapter-title">${course.title}</h1>
          <p style="color: var(--light-text-muted); margin-bottom: 0;">
            ${course.description || 'No description'}
          </p>
        </div>

        <div class="row mt-5">
          <div class="col-lg-8">
            <div style="margin-bottom: 40px;">
              <h3 style="color: var(--primary); margin-bottom: 25px;">
                <i class="fas fa-book-open"></i> Course Chapters
              </h3>
              ${chapters.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  ${chapters.map((ch, idx) => `
                    <div class="glass-card" style="cursor: pointer; transition: all 0.3s;" onclick="window.location.hash='#chapter/${ch.id}'">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="color: var(--primary); font-weight: 600; margin-bottom: 5px;">
                            Chapter ${idx + 1}
                          </div>
                          <div style="font-size: 1.1rem; font-weight: 600;">${ch.title}</div>
                        </div>
                        <i class="fas fa-arrow-right" style="color: var(--primary); font-size: 1.3rem;"></i>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="text-align: center; padding: 40px; color: var(--light-text-muted);">
                  <p>No chapters available yet.</p>
                </div>
              `}
            </div>
          </div>

          <div class="col-lg-4">
            <div class="sidebar">
              <div class="sidebar-title">Course Info</div>
              <div style="margin-bottom: 20px; font-size: 0.9rem;">
                <div style="color: var(--light-text-muted); margin-bottom: 10px;">
                  <strong>Total Chapters:</strong> ${chapters.length}
                </div>
                <div style="color: var(--light-text-muted);">
                  <strong>Created:</strong> ${formatDate(course.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    mainContent.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--secondary);">Error loading course</div>`;
  }
}

async function renderChapterPage(chapterId) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div> Loading chapter...</div>';

  try {
    const cacheBuster = `?t=${Date.now()}`;
    const chapter = await fetch(`${API_BASE}/chapters/${chapterId}${cacheBuster}`).then(r => r.json());
    const course = await fetch(`${API_BASE}/courses/${chapter.course_id}${cacheBuster}`).then(r => r.json());
    const chapters = await fetch(`${API_BASE}/chapters/course/${chapter.course_id}${cacheBuster}`).then(r => r.json());

    const currentIndex = chapters.findIndex(c => c.id == chapterId);
    const prevChapter = chapters[currentIndex - 1];
    const nextChapter = chapters[currentIndex + 1];

    mainContent.innerHTML = `
      <div class="chapter-viewer">
        <button class="btn-nav" onclick="window.location.hash='#course/${course.id}'">
          <i class="fas fa-arrow-left"></i> Back to Course
        </button>

        <div class="chapter-header" style="margin-top: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
            <div>
              <div style="font-size: 0.9rem; color: var(--light-text-muted); margin-bottom: 10px;">
                <a href="#course/${course.id}" style="color: var(--primary); text-decoration: none;">
                  ${course.title}
                </a> / Chapter ${currentIndex + 1}
              </div>
              <h1 class="chapter-title">${chapter.title}</h1>
            </div>
          </div>
          <div class="chapter-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(chapter.created_at)}</span>
            <span><i class="fas fa-user-edit"></i> Updated ${getTimeAgo(chapter.updated_at)}</span>
          </div>
        </div>

        <div class="chapter-content" id="chapterContentDiv">
          ${chapter.content ? chapter.content : '<p style="color: var(--light-text-muted);">No content available</p>'}
        </div>

        <div class="chapter-navigation">
          ${prevChapter ? `
            <button class="btn-nav" onclick="window.location.hash='#chapter/${prevChapter.id}'">
              <i class="fas fa-arrow-left"></i> Previous Chapter
            </button>
          ` : '<div></div>'}
          ${nextChapter ? `
            <button class="btn-nav" onclick="window.location.hash='#chapter/${nextChapter.id}'">
              Next Chapter <i class="fas fa-arrow-right"></i>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Render HTML content properly if it contains HTML tags
    const contentDiv = mainContent.querySelector('.chapter-content');
    if (contentDiv && chapter.content) {
      contentDiv.innerHTML = chapter.content;
    }

    // Add copy protection with funny message
    const chapterContentDiv = document.getElementById('chapterContentDiv');
    if (chapterContentDiv) {
      chapterContentDiv.addEventListener('copy', (e) => {
        e.preventDefault();
        const funnyMessages = [
          'Go type it out you lazy fool! 😤',
          'Nice try! Type it yourself! 👨‍💻',
          'Copy-paste? Really? Do the work! 💪',
          'No shortcuts here! Type it all! ✍️',
          'Learning requires typing, buddy! 📝',
          'Come on, just type it out! 😆',
          'Did you really think you could copy? Type it! ⌨️',
          'Copy and paste is for quitters! Type it! 🚀'
        ];
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        e.clipboardData.setData('text/plain', randomMessage);
      });
    }
  } catch (error) {
    mainContent.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--secondary);">Error loading chapter</div>`;
  }
}

function getIconForCourse(title) {
  const iconMap = {
    'javascript': 'js',
    'python': 'python',
    'react': 'react',
    'web': 'globe',
    'database': 'database',
    'design': 'palette',
    'mobile': 'mobile-alt'
  };

  for (let key in iconMap) {
    if (title.toLowerCase().includes(key)) {
      return iconMap[key];
    }
  }
  return 'book';
}
