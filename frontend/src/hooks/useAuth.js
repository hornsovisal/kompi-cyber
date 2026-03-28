import axios from 'axios';

/**
 * Hook for checking user role and managing role-based access control
 * Supports both student and instructor roles
 */
export const useAuth = () => {
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getUserRole = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: getAuthHeaders(),
      });

      return response.data.data?.role || 'student';
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  const isInstructor = async () => {
    const role = await getUserRole();
    return role === 'instructor';
  };

  const isStudent = async () => {
    const role = await getUserRole();
    return role === 'student';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return {
    getAuthHeaders,
    getUserRole,
    isInstructor,
    isStudent,
    logout,
  };
};
