// backend/models/courseModel.js

// In-memory courses array
const courses = [
  { id: 1, title: "Introduction to Cybersecurity", description: "Learn the fundamentals of cybersecurity", level: "Beginner", duration_hrs: 12 },
  { id: 2, title: "Ethical Hacking Essentials", description: "Learn the basics of ethical hacking and penetration testing", level: "Intermediate", duration_hrs: 15 },
  { id: 3, title: "Network Security Basics", description: "Understand core network security concepts and protocols", level: "Beginner", duration_hrs: 10 },
  { id: 4, title: "Web Application Security", description: "Protect web applications against common vulnerabilities", level: "Intermediate", duration_hrs: 14 },
  { id: 5, title: "Incident Response & Forensics", description: "Learn how to respond to security incidents and perform digital forensics", level: "Advanced", duration_hrs: 18 },
];

let nextId = courses.length + 1;

const courseModel = {
  // Find course by ID
  async findById(id) {
    const courseId = Number(id);
    return courses.find(c => c.id === courseId) || null;
  },

  // Return all courses
  async findAll() {
    return courses;
  },

  // Create a new course
  async createCourse(data) {
    const newCourse = { id: nextId++, ...data };
    courses.push(newCourse);
    return newCourse.id;
  },

  // Update an existing course
  async updateCourse(id, fields) {
    const course = courses.find(c => c.id === id);
    if (!course) return null;
    Object.assign(course, fields);
    return course;
  },

  // Delete a course
  async deleteCourse(id) {
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) courses.splice(index, 1);
  },

  // Return lessons for a course (dynamic IDs)
  async getLessonsByCourse(courseId) {
    const titles = [
      "Introduction to Cybersecurity",
      "Ethical Hacking Essentials",
      "Network Security Basics",
      "Web Application Security",
      "Incident Response & Forensics"
    ];

    return titles.map((title, index) => ({
      id: index + 1,
      courseId,
      title
    }));
  },

  // Placeholder for seeding logic
  async ensureSeedFromUploadIfEmpty() {
    // In-memory mode: nothing to do
    return;
  }
};

module.exports = courseModel;