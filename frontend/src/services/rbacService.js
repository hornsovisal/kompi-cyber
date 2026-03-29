/**
 * rbacService.js
 * API service layer for the RBAC instructor dashboard.
 * All calls go to /api/rbac/* endpoints.
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

// ── COURSES ───────────────────────────────────────────────────────────────────

export const fetchAllCourses = () =>
  axios.get(`${BASE}/api/rbac/courses`, { headers: getHeaders() }).then(r => r.data.data || []);

export const fetchCourseById = (id) =>
  axios.get(`${BASE}/api/rbac/courses/${id}`, { headers: getHeaders() }).then(r => r.data.data);

export const createCourse = (payload) =>
  axios.post(`${BASE}/api/rbac/courses`, payload, { headers: getHeaders() }).then(r => r.data.data);

export const updateCourse = (courseId, payload) =>
  axios.put(`${BASE}/api/rbac/courses/${courseId}`, payload, { headers: getHeaders() }).then(r => r.data.data);

export const deleteCourse = (courseId) =>
  axios.delete(`${BASE}/api/rbac/courses/${courseId}`, { headers: getHeaders() }).then(r => r.data);

export const assignInstructor = (courseId, instructorEmployeeId) =>
  axios
    .post(`${BASE}/api/rbac/courses/assign-instructor`, { courseId, instructorEmployeeId }, { headers: getHeaders() })
    .then(r => r.data);

// ── STUDENTS ──────────────────────────────────────────────────────────────────

export const fetchCourseStudents = (courseId) =>
  axios.get(`${BASE}/api/rbac/courses/${courseId}/students`, { headers: getHeaders() }).then(r => r.data.data || []);

export const inviteStudent = (courseId, email, name = '') =>
  axios
    .post(`${BASE}/api/rbac/courses/${courseId}/invite-student`, { email, name }, { headers: getHeaders() })
    .then(r => r.data);

export const fetchCourseInvitations = (courseId) =>
  axios.get(`${BASE}/api/rbac/courses/${courseId}/invitations`, { headers: getHeaders() }).then(r => r.data.data || []);

export const resendInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/resend`, {}, { headers: getHeaders() }).then(r => r.data);

export const cancelInvitation = (invitationId) =>
  axios.delete(`${BASE}/api/rbac/invitations/${invitationId}`, { headers: getHeaders() }).then(r => r.data);

export const fetchMyInvitations = () =>
  axios.get(`${BASE}/api/rbac/invitations`, { headers: getHeaders() }).then(r => r.data.data || []);

export const acceptCourseInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/accept`, {}, { headers: getHeaders() }).then(r => r.data);

export const rejectCourseInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/reject`, {}, { headers: getHeaders() }).then(r => r.data);

// ── INSTRUCTORS ───────────────────────────────────────────────────────────────

export const fetchInstructors = () =>
  axios.get(`${BASE}/api/rbac/instructors`, { headers: getHeaders() }).then(r => r.data.data || []);

// ── QUIZZES ───────────────────────────────────────────────────────────────────

export const fetchMyRbacQuizzes = () =>
  axios.get(`${BASE}/api/rbac/quizzes/my`, { headers: getHeaders() }).then(r => r.data.data || []);

export const fetchQuizzesByCourse = (courseId) =>
  axios.get(`${BASE}/api/rbac/quizzes/course/${courseId}`, { headers: getHeaders() }).then(r => r.data.data || []);

export const fetchRbacQuizById = (quizId) =>
  axios.get(`${BASE}/api/rbac/quizzes/${quizId}`, { headers: getHeaders() }).then(r => r.data.data);

export const createRbacQuiz = (payload) =>
  axios.post(`${BASE}/api/rbac/quizzes`, payload, { headers: getHeaders() }).then(r => r.data.data);

export const updateRbacQuiz = (quizId, payload) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}`, payload, { headers: getHeaders() }).then(r => r.data.data);

export const deleteRbacQuiz = (quizId) =>
  axios.delete(`${BASE}/api/rbac/quizzes/${quizId}`, { headers: getHeaders() }).then(r => r.data);

export const openQuiz = (quizId) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}/open`, {}, { headers: getHeaders() }).then(r => r.data);

export const closeQuiz = (quizId) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}/close`, {}, { headers: getHeaders() }).then(r => r.data);
