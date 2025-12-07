// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Backend URL

export const fetchExercises = async () => {
  try {
    const response = await axios.get(`${API_URL}/exercises`);
    return response.data; // Return data to be used in components
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Throw error to be handled in the component
  }
};
