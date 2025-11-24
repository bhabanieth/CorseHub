// Default seed data for courses
const seedData = {
  courses: [
    {
      id: 1,
      title: "Introduction to Web Development",
      description: "Learn the basics of HTML, CSS, and JavaScript",
      cover_image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop",
      difficulty: "Beginner",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      description: "Master ES6+ features and async programming",
      cover_image: "https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=400&h=250&fit=crop",
      difficulty: "Intermediate",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Full Stack Development",
      description: "Build complete applications with Node.js and React",
      cover_image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop",
      difficulty: "Advanced",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

module.exports = seedData;
