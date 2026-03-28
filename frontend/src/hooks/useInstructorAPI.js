import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const useInstructorAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Courses
  const fetchInstructorCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/instructor/courses`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch courses';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Quizzes
  const fetchMyQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/quizzes/my`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || [];
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch quizzes';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizById = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/quizzes/${quizId}`, {
        headers: getAuthHeaders(),
      });
      return response.data.data || null;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch quiz';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuiz = useCallback(async (quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        `${API_BASE}/api/quizzes/create`,
        quizData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create quiz';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuiz = useCallback(async (quizId, quizData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${API_BASE}/api/quizzes/${quizId}`,
        quizData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update quiz';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuiz = useCallback(async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(`${API_BASE}/api/quizzes/${quizId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete quiz';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentPerformance = useCallback(async (course) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE}/api/students/performance`, {
        params: course ? { course } : undefined,
        headers: getAuthHeaders(),
      });
      return response.data.data || {};
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch student performance';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    fetchInstructorCourses,
    fetchMyQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    fetchStudentPerformance,
  };
};
