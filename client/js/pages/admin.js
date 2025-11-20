// Admin panel pages

async function renderAdminDashboard() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="admin-container">
      <div class="hero" style="padding: 40px 0;">
        <h1 style="font-size: 2.5rem; margin-bottom: 15px;">
          <i class="fas fa-cog"></i> Admin Dashboard
        </h1>
        <p>Manage your courses, chapters, and announcements</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="admin-tabs">
        <button class="admin-tab active" onclick="switchAdminTab('dashboard')">
          <i class="fas fa-chart-line"></i> Dashboard
        </button>
        <button class="admin-tab" onclick="switchAdminTab('courses')">
          <i class="fas fa-book"></i> Courses
        </button>
        <button class="admin-tab" onclick="switchAdminTab('chapters')">
          <i class="fas fa-list"></i> Chapters
        </button>
        <button class="admin-tab" onclick="switchAdminTab('announcements')">
          <i class="fas fa-megaphone"></i> Announcements
        </button>
      </div>

      <!-- Dashboard Tab -->
      <div id="tab-dashboard" class="tab-content active">
        <div class="row">
          <div class="col-md-3">
            <div class="glass-card text-center" style="padding: 30px;">
              <div style="font-size: 2.5rem; color: var(--primary); margin-bottom: 10px;">
                <i class="fas fa-book-open"></i>
              </div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 5px;" id="course-count">0</div>
              <div style="color: var(--light-text-muted);">Total Courses</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="glass-card text-center" style="padding: 30px;">
              <div style="font-size: 2.5rem; color: var(--secondary); margin-bottom: 10px;">
                <i class="fas fa-file-alt"></i>
              </div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--secondary); margin-bottom: 5px;" id="chapter-count">0</div>
              <div style="color: var(--light-text-muted);">Total Chapters</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="glass-card text-center" style="padding: 30px;">
              <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 10px;">
                <i class="fas fa-bullhorn"></i>
              </div>
              <div style="font-size: 2rem; font-weight: 700; color: var(--accent); margin-bottom: 5px;" id="announcement-count">0</div>
              <div style="color: var(--light-text-muted);">Announcements</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="glass-card text-center" style="padding: 30px;">
              <div style="font-size: 2.5rem; color: #00ff88; margin-bottom: 10px;">
                <i class="fas fa-eye"></i>
              </div>
              <div style="font-size: 2rem; font-weight: 700; color: #00ff88; margin-bottom: 5px;" id="active-announcement-count">0</div>
              <div style="color: var(--light-text-muted);">Active</div>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <h3 style="color: var(--primary); margin-bottom: 25px;">
            <i class="fas fa-rocket"></i> Quick Actions
          </h3>
          <div class="row">
            <div class="col-md-6">
              <button class="btn-primary w-100" onclick="switchAdminTab('courses')" style="padding: 15px; font-size: 1rem;">
                <i class="fas fa-plus"></i> Create New Course
              </button>
            </div>
            <div class="col-md-6">
              <button class="btn-primary w-100" onclick="switchAdminTab('announcements')" style="padding: 15px; font-size: 1rem;">
                <i class="fas fa-plus"></i> Create Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Courses Tab -->
      <div id="tab-courses" class="tab-content"></div>

      <!-- Chapters Tab -->
      <div id="tab-chapters" class="tab-content"></div>

      <!-- Announcements Tab -->
      <div id="tab-announcements" class="tab-content"></div>
    </div>
  `;

  // Load dashboard stats
  await loadDashboardStats();
}

function switchAdminTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(`tab-${tabName}`).classList.add('active');
  event?.target?.classList.add('active');

  // Load tab content
  if (tabName === 'courses') {
    renderAdminCourses();
  } else if (tabName === 'chapters') {
    renderAdminChapters();
  } else if (tabName === 'announcements') {
    renderAdminAnnouncements();
  }
}

async function loadDashboardStats() {
  try {
    const [courses, announcements] = await Promise.all([
      fetch(`${API_BASE}/courses`).then(r => r.json()),
      fetch(`${API_BASE}/announcements/admin/all`).then(r => r.json()).catch(() => [])
    ]);

    // Count chapters
    let chapterCount = 0;
    if (courses.length > 0) {
      const chaptersData = await Promise.all(
        courses.map(c => fetch(`${API_BASE}/chapters/course/${c.id}`).then(r => r.json()).catch(() => []))
      );
      chapterCount = chaptersData.reduce((sum, chs) => sum + chs.length, 0);
    }

    document.getElementById('course-count').textContent = courses.length;
    document.getElementById('chapter-count').textContent = chapterCount;
    document.getElementById('announcement-count').textContent = announcements.length;
    document.getElementById('active-announcement-count').textContent = 
      announcements.filter(a => a.is_active).length;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function renderAdminCourses() {
  const tabContent = document.getElementById('tab-courses');
  tabContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div> Loading courses...</div>';

  try {
    const courses = await fetch(`${API_BASE}/courses`).then(r => r.json());

    tabContent.innerHTML = `
      <div class="form-section">
        <h3 class="form-title"><i class="fas fa-plus"></i> Create New Course</h3>
        <form onsubmit="handleCreateCourse(event)">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Course Title *</label>
              <input type="text" class="form-control" id="courseTitle" required>
            </div>
            <div class="form-group">
              <label class="form-label">Cover Image URL</label>
              <input type="text" class="form-control" id="courseCoverImage" placeholder="https://...">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Course Description</label>
            <textarea class="form-control" id="courseDescription" rows="3" placeholder="Describe your course..."></textarea>
          </div>
          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> Create Course
          </button>
        </form>
      </div>

      <div style="margin-top: 40px;">
        <h3 style="color: var(--primary); margin-bottom: 25px;">
          <i class="fas fa-list"></i> Your Courses (${courses.length})
        </h3>
        ${courses.length > 0 ? `
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${courses.map(course => `
                  <tr>
                    <td><strong>${course.title}</strong></td>
                    <td>${course.description ? course.description.substring(0, 50) + '...' : 'No description'}</td>
                    <td>${formatDate(course.created_at)}</td>
                    <td>
                      <button class="btn-small" onclick="editCourse(${course.id})" style="padding: 6px 12px; background: var(--primary); color: var(--dark-bg); border: none;">
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button class="btn-small" onclick="deleteCourse(${course.id})" style="padding: 6px 12px; background: var(--secondary); color: white; border: none;">
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="text-align: center; padding: 40px; color: var(--light-text-muted);">
            <p>No courses yet. Create your first course above!</p>
          </div>
        `}
      </div>
    `;
  } catch (error) {
    tabContent.innerHTML = `<div style="color: var(--secondary);">Error loading courses: ${error.message}</div>`;
  }
}

async function renderAdminChapters() {
  const tabContent = document.getElementById('tab-chapters');
  tabContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div> Loading data...</div>';

  try {
    const courses = await fetch(`${API_BASE}/courses`).then(r => r.json());

    if (courses.length === 0) {
      tabContent.innerHTML = `<div style="color: var(--light-text-muted); text-align: center; padding: 40px;">Create a course first to add chapters.</div>`;
      return;
    }

    tabContent.innerHTML = `
      <div class="form-section">
        <h3 class="form-title"><i class="fas fa-plus"></i> Create New Chapter</h3>
        <form onsubmit="handleCreateChapter(event)">
          <div class="form-group">
            <label class="form-label">Select Course *</label>
            <select class="form-control" id="chapterCourse" required onchange="loadChaptersForCourse()">
              <option value="">-- Select a course --</option>
              ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Chapter Title *</label>
            <input type="text" class="form-control" id="chapterTitle" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">Write Your Content (Text & Code) *</label>
            <textarea class="form-control" id="chapterContent" required style="min-height: 400px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 1rem; color: #ffffff; background: #2a2a3e; border: 2px solid #00d4ff;" placeholder="Write your chapter explanation, code examples, and instructions here..."></textarea>
          </div>

          <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h5 style="color: var(--primary); margin-bottom: 15px;"><i class="fas fa-image"></i> Add Images & Videos</h5>
            
            <div class="form-group">
              <label class="form-label">Image URL (Optional)</label>
              <input type="url" class="form-control" id="chapterImage" placeholder="https://example.com/image.jpg">
              <small style="color: var(--light-text-muted); display: block; margin-top: 5px;">Paste the full URL of an image</small>
            </div>

            <div class="form-group">
              <label class="form-label">Video URL (Optional)</label>
              <input type="url" class="form-control" id="chapterVideo" placeholder="https://youtube.com/watch?v=... or https://vimeo.com/...">
              <small style="color: var(--light-text-muted); display: block; margin-top: 5px;">Works with YouTube, Vimeo, or direct video links</small>
            </div>
          </div>

          <button type="submit" class="btn-primary">
            <i class="fas fa-save"></i> Create Chapter
          </button>
        </form>
      </div>

      <div style="margin-top: 40px;">
        <h3 style="color: var(--primary); margin-bottom: 25px;">
          <i class="fas fa-list"></i> All Chapters
        </h3>
        <div id="chaptersListContainer" style="color: var(--light-text-muted); text-align: center; padding: 40px;">
          Select a course to view chapters
        </div>
      </div>
    `;

  } catch (error) {
    tabContent.innerHTML = `<div style="color: var(--secondary);">Error loading chapters: ${error.message}</div>`;
  }
}

async function renderAdminAnnouncements() {
  const tabContent = document.getElementById('tab-announcements');
  tabContent.innerHTML = '<div style="text-align: center; padding: 40px;"><div class="loading"></div> Loading announcements...</div>';

  try {
    const announcements = await fetch(`${API_BASE}/announcements/admin/all`).then(r => r.json()).catch(() => []);

    tabContent.innerHTML = `
      <div class="form-section">
        <h3 class="form-title"><i class="fas fa-plus"></i> Create New Announcement</h3>
        <form onsubmit="handleCreateAnnouncement(event)">
          <div class="form-group">
            <label class="form-label">Title *</label>
            <input type="text" class="form-control" id="announcementTitle" required>
          </div>
          <div class="form-group">
            <label class="form-label">Content *</label>
            <textarea class="form-control" id="announcementContent" rows="4" required placeholder="Write your announcement..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Expires At (Optional)</label>
              <input type="datetime-local" class="form-control" id="announcementExpires">
            </div>
          </div>
          <button type="submit" class="btn-primary">
            <i class="fas fa-paper-plane"></i> Post Announcement
          </button>
        </form>
      </div>

      <div style="margin-top: 40px;">
        <h3 style="color: var(--primary); margin-bottom: 25px;">
          <i class="fas fa-list"></i> All Announcements (${announcements.length})
        </h3>
        ${announcements.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 15px;">
            ${announcements.map(ann => `
              <div class="announcement-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                  <div>
                    <div class="announcement-title">${ann.title}</div>
                    <div class="announcement-content" style="margin-top: 10px;">${ann.content}</div>
                  </div>
                  <div style="display: flex; gap: 10px;">
                    <button class="btn-small" onclick="toggleAnnouncement(${ann.id}, ${!ann.is_active})" style="padding: 6px 12px;">
                      ${ann.is_active ? '<i class="fas fa-eye-slash"></i> Deactivate' : '<i class="fas fa-eye"></i> Activate'}
                    </button>
                    <button class="btn-small" onclick="deleteAnnouncement(${ann.id})" style="padding: 6px 12px; background: var(--secondary); color: white; border: none;">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
                <div class="announcement-time">
                  <strong>Posted:</strong> ${formatDate(ann.created_at)}
                  ${ann.expires_at ? `<br><strong>Expires:</strong> ${formatDate(ann.expires_at)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 40px; color: var(--light-text-muted);">
            <p>No announcements yet. Create your first announcement above!</p>
          </div>
        `}
      </div>
    `;
  } catch (error) {
    tabContent.innerHTML = `<div style="color: var(--secondary);">Error loading announcements: ${error.message}</div>`;
  }
}

// Quill Editor Initialization
// Simple chapter creation - no complex editor needed
// Using plain textarea for text and simple URL inputs for media

// Form handlers
async function handleCreateCourse(e) {
  e.preventDefault();
  
  const title = document.getElementById('courseTitle').value;
  const description = document.getElementById('courseDescription').value;
  const cover_image = document.getElementById('courseCoverImage').value;

  try {
    const response = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, cover_image })
    });

    if (response.ok) {
      showAlert('Course created successfully!', 'success');
      await renderAdminCourses();
      await loadDashboardStats();
    } else {
      showAlert('Error creating course', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

async function handleCreateChapter(e) {
  e.preventDefault();

  const course_id = document.getElementById('chapterCourse').value;
  const title = document.getElementById('chapterTitle').value;
  const textContent = document.getElementById('chapterContent').value;
  const imageUrl = document.getElementById('chapterImage').value;
  const videoUrl = document.getElementById('chapterVideo').value;

  // Escape HTML to prevent issues
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Build HTML content with proper formatting and VISIBLE colors
  let content = `<h2 style="color: #00d4ff; margin: 20px 0 15px 0; font-size: 1.7rem; font-weight: 700;">${escapeHtml(title)}</h2>`;
  
  // Convert text content - handle code blocks and paragraphs
  const paragraphs = textContent.split('\n\n');
  
  paragraphs.forEach(para => {
    const trimmed = para.trim();
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      // Code block
      const codeContent = trimmed.slice(3, -3).trim();
      content += `<pre style="background: #1a1a2e; color: #00ff88; padding: 20px; border-radius: 8px; border-left: 5px solid #00d4ff; overflow-x: auto; margin: 20px 0; font-size: 0.9rem;"><code style="background: none; color: #00ff88; font-family: 'Courier New', monospace; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(codeContent)}</code></pre>`;
    } else if (trimmed) {
      // Regular paragraph - WHITE text on the glass background
      const formattedLine = escapeHtml(trimmed).replace(/\n/g, '<br>');
      content += `<p style="color: #ffffff !important; font-size: 1.05rem !important; line-height: 1.8 !important; margin-bottom: 15px; font-weight: 500; background: transparent; text-shadow: none;">${formattedLine}</p>`;
    }
  });
  
  if (imageUrl && imageUrl.trim()) {
    content += `<div style="margin: 30px 0;"><img src="${escapeHtml(imageUrl)}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);"></div>`;
  }
  
  if (videoUrl && videoUrl.trim()) {
    // Check if it's a YouTube URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('v=')) {
        videoId = videoUrl.split('v=')[1].split('&')[0];
      } else {
        videoId = videoUrl.split('/').pop();
      }
      content += `<div style="margin: 30px 0;"><iframe width="100%" height="450" src="https://www.youtube.com/embed/${escapeHtml(videoId)}" frameborder="0" allowfullscreen style="border-radius: 8px; border: 2px solid #00d4ff;"></iframe></div>`;
    } else {
      content += `<div style="margin: 30px 0;"><video width="100%" height="auto" controls style="border-radius: 8px; border: 2px solid #00d4ff;"><source src="${escapeHtml(videoUrl)}" type="video/mp4">Your browser does not support the video tag.</video></div>`;
    }
  }

  try {
    const response = await fetch(`${API_BASE}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id, title, content })
    });

    if (response.ok) {
      showAlert('Chapter created successfully!', 'success');
      document.getElementById('chapterTitle').value = '';
      document.getElementById('chapterContent').value = '';
      document.getElementById('chapterImage').value = '';
      document.getElementById('chapterVideo').value = '';
      await loadChaptersForCourse();
      await loadDashboardStats();
    } else {
      showAlert('Error creating chapter', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

async function handleCreateAnnouncement(e) {
  e.preventDefault();

  const title = document.getElementById('announcementTitle').value;
  const content = document.getElementById('announcementContent').value;
  const expires_at = document.getElementById('announcementExpires').value || null;

  try {
    const response = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, expires_at })
    });

    if (response.ok) {
      showAlert('Announcement posted successfully!', 'success');
      document.getElementById('announcementTitle').value = '';
      document.getElementById('announcementContent').value = '';
      document.getElementById('announcementExpires').value = '';
      await renderAdminAnnouncements();
      await loadDashboardStats();
    } else {
      showAlert('Error creating announcement', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

async function loadChaptersForCourse() {
  const courseId = document.getElementById('chapterCourse').value;
  const container = document.getElementById('chaptersListContainer');

  if (!courseId) {
    container.innerHTML = '<div style="color: var(--light-text-muted); text-align: center; padding: 40px;">Select a course to view chapters</div>';
    return;
  }

  try {
    const chapters = await fetch(`${API_BASE}/chapters/course/${courseId}`).then(r => r.json());

    if (chapters.length === 0) {
      container.innerHTML = '<div style="color: var(--light-text-muted); text-align: center; padding: 40px;">No chapters in this course yet.</div>';
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${chapters.map((ch, idx) => `
            <div class="glass-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="color: var(--primary); font-weight: 600; margin-bottom: 5px;">Chapter ${idx + 1}</div>
                  <div style="font-size: 1.1rem; font-weight: 600;">${ch.title}</div>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button class="btn-small" onclick="editChapter(${ch.id})" style="padding: 6px 12px; background: var(--primary); color: var(--dark-bg); border: none;">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn-small" onclick="deleteChapter(${ch.id})" style="padding: 6px 12px; background: var(--secondary); color: white; border: none;">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    container.innerHTML = `<div style="color: var(--secondary);">Error loading chapters</div>`;
  }
}

// Delete functions
async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course and all its chapters?')) return;

  try {
    await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
    showAlert('Course deleted successfully!', 'success');
    await renderAdminCourses();
    await loadDashboardStats();
  } catch (error) {
    showAlert('Error deleting course', 'danger');
  }
}

async function deleteChapter(id) {
  if (!confirm('Are you sure you want to delete this chapter?')) return;

  try {
    await fetch(`${API_BASE}/chapters/${id}`, { method: 'DELETE' });
    showAlert('Chapter deleted successfully!', 'success');
    await loadChaptersForCourse();
    await loadDashboardStats();
  } catch (error) {
    showAlert('Error deleting chapter', 'danger');
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Are you sure?')) return;

  try {
    await fetch(`${API_BASE}/announcements/${id}`, { method: 'DELETE' });
    showAlert('Announcement deleted!', 'success');
    await renderAdminAnnouncements();
    await loadDashboardStats();
  } catch (error) {
    showAlert('Error deleting announcement', 'danger');
  }
}

async function toggleAnnouncement(id, isActive) {
  const announcement = await fetch(`${API_BASE}/announcements`).then(r => r.json()).then(anns => anns.find(a => a.id == id));

  try {
    await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...announcement,
        is_active: isActive
      })
    });
    showAlert(isActive ? 'Announcement activated!' : 'Announcement deactivated!', 'success');
    await renderAdminAnnouncements();
  } catch (error) {
    showAlert('Error toggling announcement', 'danger');
  }
}

function editCourse(id) {
  showAlert('Edit feature coming soon', 'info');
}

function editChapter(id) {
  showAlert('Edit feature coming soon', 'info');
}
