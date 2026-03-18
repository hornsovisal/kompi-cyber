// backend/models/enrollmentModel.js
const enrollments = [];

const enrollmentModel = {
  async isEnrolled(userId, courseId) {
    return enrollments.some(e => e.userId === userId && e.courseId === courseId);
  },

  async enroll(userId, courseId) {
    if (await this.isEnrolled(userId, courseId)) return null;
    const enrollment = { userId, courseId, enrolled_at: new Date() };
    enrollments.push(enrollment);
    return enrollment;
  },

  async getByUserId(userId) {
    return enrollments.filter(e => e.userId === userId);
  },

  async unenroll(userId, courseId) {
    const index = enrollments.findIndex(e => e.userId === userId && e.courseId === courseId);
    if (index !== -1) enrollments.splice(index, 1);
  }
};

module.exports = enrollmentModel;