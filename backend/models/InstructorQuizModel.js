/**
 * In-memory store for instructor-managed quizzes.
 * Shape: { id, title, description, course, dueDate, dueTime, createdBy, createdAt }
 * Easy to swap for a real DB later — just replace the array methods with DB queries.
 */

let quizzes = [];
let nextId = 1;

/**
 * Return all quizzes owned by a specific lecturer.
 * @param {number|string} lecturerId
 */
const findByLecturer = (lecturerId) =>
  quizzes.filter((q) => String(q.createdBy) === String(lecturerId));

/**
 * Find one quiz by id (regardless of owner).
 * @param {number|string} id
 */
const findById = (id) => quizzes.find((q) => String(q.id) === String(id)) || null;

/**
 * Create and persist a new quiz.
 * @param {{ title, description, course, dueDate, dueTime, createdBy }} data
 * @returns the new quiz object
 */
const create = (data) => {
  const quiz = {
    id: nextId++,
    title: data.title,
    description: data.description || '',
    course: data.course,
    dueDate: data.dueDate,
    dueTime: data.dueTime,
    createdBy: data.createdBy,
    createdAt: new Date().toISOString(),
  };
  quizzes.push(quiz);
  return quiz;
};

/**
 * Update fields of an existing quiz in place.
 * @param {number|string} id
 * @param {{ title?, description?, course?, dueDate?, dueTime? }} fields
 * @returns the updated quiz or null
 */
const update = (id, fields) => {
  const quiz = findById(id);
  if (!quiz) return null;

  const allowed = ['title', 'description', 'course', 'dueDate', 'dueTime'];
  allowed.forEach((key) => {
    if (fields[key] !== undefined) quiz[key] = fields[key];
  });
  quiz.updatedAt = new Date().toISOString();
  return quiz;
};

/**
 * Remove a quiz from the store.
 * @param {number|string} id
 * @returns true if removed, false if not found
 */
const remove = (id) => {
  const index = quizzes.findIndex((q) => String(q.id) === String(id));
  if (index === -1) return false;
  quizzes.splice(index, 1);
  return true;
};

module.exports = { findByLecturer, findById, create, update, remove };
