import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Skin Analysis API
export const analyzeSkinQuiz = async (quizData) => {
  try {
    const response = await api.post('/analyze-skin/quiz', quizData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing skin with quiz:', error);
    throw error;
  }
};

export const analyzeSkinImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/analyze-skin/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing skin image:', error);
    throw error;
  }
};

// Product Recommendations API
export const getRecommendations = async (filters = {}) => {
  try {
    const response = await api.post('/recommendations', filters);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const getProductDetails = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

// User Profile API
export const getUserProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateAllergies = async (allergiesData) => {
  try {
    const response = await api.put('/user/allergies', allergiesData);
    return response.data;
  } catch (error) {
    console.error('Error updating allergies:', error);
    throw error;
  }
};

export const updateLifestyleFactors = async (lifestyleData) => {
  try {
    const response = await api.put('/user/lifestyle', lifestyleData);
    return response.data;
  } catch (error) {
    console.error('Error updating lifestyle factors:', error);
    throw error;
  }
};

// Routine API
export const getUserRoutine = async () => {
  try {
    const response = await api.get('/user/routine');
    return response.data;
  } catch (error) {
    console.error('Error fetching user routine:', error);
    throw error;
  }
};

export const saveUserRoutine = async (routineData) => {
  try {
    const response = await api.post('/user/routine', routineData);
    return response.data;
  } catch (error) {
    console.error('Error saving user routine:', error);
    throw error;
  }
};

// Progress Tracking API
export const uploadProgressImage = async (imageFile, notes) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('notes', notes);
    
    const response = await api.post('/user/progress', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading progress image:', error);
    throw error;
  }
};

export const getProgressHistory = async () => {
  try {
    const response = await api.get('/user/progress');
    return response.data;
  } catch (error) {
    console.error('Error fetching progress history:', error);
    throw error;
  }
};

// Product Feedback API
export const submitProductFeedback = async (productId, rating, feedback) => {
  try {
    const response = await api.post('/feedback', { productId, rating, feedback });
    return response.data;
  } catch (error) {
    console.error('Error submitting product feedback:', error);
    throw error;
  }
};

export default api;
