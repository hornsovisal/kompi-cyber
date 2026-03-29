/**
 * Course Type Utility Helpers
 * Used to determine course enrollment and invitation behavior
 */

/**
 * Check if a course is instructor-led
 * @param {Object} course - Course object with course_type property
 * @returns {boolean} True if course is instructor-led
 */
export const isInstructorLed = (course) => {
  return course?.course_type === "instructor-led";
};

/**
 * Check if a course is online-led
 * @param {Object} course - Course object with course_type property
 * @returns {boolean} True if course is online-led
 */
export const isOnlineLed = (course) => {
  return course?.course_type === "online-led";
};

/**
 * Get enrollment requirement text based on course type
 * @param {string} courseType - Course type: 'online-led' or 'instructor-led'
 * @returns {string} Human-readable description
 */
export const getEnrollmentRequirement = (courseType) => {
  if (courseType === "instructor-led") {
    return "Requires invitation from instructor";
  }
  return "Public course - enroll directly";
};

/**
 * Get course type badge information
 * @param {string} courseType - Course type: 'online-led' or 'instructor-led'
 * @returns {Object} Badge info with label and color
 */
export const getCourseBadgeInfo = (courseType) => {
  if (courseType === "instructor-led") {
    return {
      label: "Instructor-Led",
      color: "bg-purple-100 text-purple-800",
      icon: "👨‍🏫",
    };
  }
  return {
    label: "Self-Paced",
    color: "bg-blue-100 text-blue-800",
    icon: "📚",
  };
};

/**
 * Determine if student can directly enroll in course
 * @param {Object} course - Course object
 * @param {Object} studentInvitations - Student's invitations array
 * @returns {boolean} True if can enroll directly
 */
export const canEnrollDirectly = (course, studentInvitations = []) => {
  // Can only enroll directly if course is online-led
  if (isOnlineLed(course)) {
    return true;
  }

  // For instructor-led, check if student has pending invitation
  if (isInstructorLed(course)) {
    return studentInvitations.some(
      (inv) => inv.course_id === course.id && inv.status === "pending",
    );
  }

  return false;
};

/**
 * Get enrollment action button text
 * @param {Object} course - Course object
 * @param {boolean} isEnrolled - Whether student is already enrolled
 * @returns {string} Button text
 */
export const getEnrollmentButtonText = (course, isEnrolled = false) => {
  if (isEnrolled) {
    return "Continue Learning";
  }

  if (isOnlineLed(course)) {
    return "Enroll Now";
  }

  return "Awaiting Invitation";
};

/**
 * Filter courses by type
 * @param {Array} courses - Array of course objects
 * @param {string} type - 'online-led' or 'instructor-led'
 * @returns {Array} Filtered courses
 */
export const filterCoursesByType = (courses, type) => {
  return courses.filter((course) => course.course_type === type);
};

/**
 * Sort courses: instructor-led with pending invitations first
 * @param {Array} courses - Array of courses
 * @param {Array} invitations - Array of student invitations
 * @returns {Array} Sorted courses
 */
export const sortCoursesByInvitations = (courses, invitations = []) => {
  const pendingInvitationCourseIds = invitations
    .filter((inv) => inv.status === "pending")
    .map((inv) => inv.course_id);

  return [...courses].sort((a, b) => {
    const aHasPending = pendingInvitationCourseIds.includes(a.id);
    const bHasPending = pendingInvitationCourseIds.includes(b.id);

    if (aHasPending && !bHasPending) return -1;
    if (!aHasPending && bHasPending) return 1;
    return 0;
  });
};

/**
 * Get invitation status for a course
 * @param {number} courseId - Course ID
 * @param {Array} invitations - Student's invitations
 * @returns {string|null} Invitation status or null
 */
export const getInvitationStatus = (courseId, invitations = []) => {
  const invitation = invitations.find((inv) => inv.course_id === courseId);
  return invitation?.status || null;
};

/**
 * Check if student needs to take action (has pending invitation)
 * @param {number} courseId - Course ID
 * @param {Array} invitations - Student's invitations
 * @returns {boolean} True if invitation is pending
 */
export const hasPendingInvitation = (courseId, invitations = []) => {
  return getInvitationStatus(courseId, invitations) === "pending";
};

export default {
  isInstructorLed,
  isOnlineLed,
  getEnrollmentRequirement,
  getCourseBadgeInfo,
  canEnrollDirectly,
  getEnrollmentButtonText,
  filterCoursesByType,
  sortCoursesByInvitations,
  getInvitationStatus,
  hasPendingInvitation,
};
