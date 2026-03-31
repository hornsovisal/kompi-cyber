/**
 * rbacService.js
 * API service layer for the RBAC instructor dashboard.
 * All calls go to /api/rbac/* endpoints.
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '';

const getStored = (key) => sessionStorage.getItem(key);

const getHeaders = () => ({
  Authorization: `Bearer ${getStored('token')}`,
  'Content-Type': 'application/json',
});

const getPayload = (response) => response?.data?.data ?? response?.data;
const getListPayload = (response) => {
  const payload = getPayload(response);
  return Array.isArray(payload) ? payload : [];
};

// ── COURSES ───────────────────────────────────────────────────────────────────

export const fetchAllCourses = () =>
  axios.get(`${BASE}/api/rbac/courses`, { headers: getHeaders() }).then(getListPayload);

export const fetchCourseById = (id) =>
  axios.get(`${BASE}/api/rbac/courses/${id}`, { headers: getHeaders() }).then(getPayload);

export const createCourse = (payload) =>
  axios.post(`${BASE}/api/rbac/courses`, payload, { headers: getHeaders() }).then(getPayload);

export const updateCourse = (courseId, payload) =>
  axios.put(`${BASE}/api/rbac/courses/${courseId}`, payload, { headers: getHeaders() }).then(getPayload);

export const deleteCourse = (courseId) =>
  axios.delete(`${BASE}/api/rbac/courses/${courseId}`, { headers: getHeaders() }).then(getPayload);

export const assignInstructor = (courseId, instructorEmployeeId) =>
  axios
    .post(`${BASE}/api/rbac/courses/assign-instructor`, { courseId, instructorEmployeeId }, { headers: getHeaders() })
    .then(getPayload);

// ── STUDENTS ──────────────────────────────────────────────────────────────────

export const fetchCourseStudents = (courseId) =>
  axios.get(`${BASE}/api/rbac/courses/${courseId}/students`, { headers: getHeaders() }).then(getListPayload);

export const inviteStudent = (courseId, email, name = '') =>
  axios
    .post(`${BASE}/api/rbac/courses/${courseId}/invite-student`, { email, name }, { headers: getHeaders() })
    .then(getPayload);

export const fetchCourseInvitations = (courseId) =>
  axios.get(`${BASE}/api/rbac/courses/${courseId}/invitations`, { headers: getHeaders() }).then(getListPayload);

export const resendInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/resend`, {}, { headers: getHeaders() }).then(getPayload);

export const cancelInvitation = (invitationId) =>
  axios.delete(`${BASE}/api/rbac/invitations/${invitationId}`, { headers: getHeaders() }).then(getPayload);

export const fetchMyInvitations = () =>
  axios.get(`${BASE}/api/rbac/invitations`, { headers: getHeaders() }).then(getListPayload);

export const acceptCourseInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/accept`, {}, { headers: getHeaders() }).then(getPayload);

export const rejectCourseInvitation = (invitationId) =>
  axios.post(`${BASE}/api/rbac/invitations/${invitationId}/reject`, {}, { headers: getHeaders() }).then(getPayload);

// ── INSTRUCTORS ───────────────────────────────────────────────────────────────

export const fetchInstructors = () =>
  axios.get(`${BASE}/api/rbac/instructors`, { headers: getHeaders() }).then(getListPayload);

// ── QUIZZES ───────────────────────────────────────────────────────────────────

export const fetchMyRbacQuizzes = () =>
  axios.get(`${BASE}/api/rbac/quizzes/my`, { headers: getHeaders() }).then(getListPayload);

export const fetchQuizzesByCourse = (courseId) =>
  axios.get(`${BASE}/api/rbac/quizzes/course/${courseId}`, { headers: getHeaders() }).then(getListPayload);

export const fetchRbacQuizById = (quizId) =>
  axios.get(`${BASE}/api/rbac/quizzes/${quizId}`, { headers: getHeaders() }).then(getPayload);

export const createRbacQuiz = (payload) =>
  axios.post(`${BASE}/api/rbac/quizzes`, payload, { headers: getHeaders() }).then(getPayload);

export const updateRbacQuiz = (quizId, payload) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}`, payload, { headers: getHeaders() }).then(getPayload);

export const deleteRbacQuiz = (quizId) =>
  axios.delete(`${BASE}/api/rbac/quizzes/${quizId}`, { headers: getHeaders() }).then(getPayload);

export const openQuiz = (quizId) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}/open`, {}, { headers: getHeaders() }).then(getPayload);

export const closeQuiz = (quizId) =>
  axios.put(`${BASE}/api/rbac/quizzes/${quizId}/close`, {}, { headers: getHeaders() }).then(getPayload);
