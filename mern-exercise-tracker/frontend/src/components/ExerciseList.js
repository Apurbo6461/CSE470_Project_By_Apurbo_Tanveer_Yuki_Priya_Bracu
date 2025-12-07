// src/components/ExerciseList.js
import React, { useEffect, useState } from 'react';
import { fetchExercises } from '../services/apiService';

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const getExercises = async () => {
      try {
        const data = await fetchExercises();  // Fetch exercises from backend
        setExercises(data);  // Set exercises in state
      } catch (error) {
        console.error('Error loading exercises:', error);
      }
    };

    getExercises();
  }, []);  // Empty dependency array, fetch once when component mounts

  return (
    <div>
      <h1>Exercise List</h1>
      {exercises.length > 0 ? (
        <ul>
          {exercises.map((exercise, index) => (
            <li key={index}>{exercise.name}</li>  // Display each exercise
          ))}
        </ul>
      ) : (
        <p>Loading exercises...</p>  // Display loading message
      )}
    </div>
  );
};

export default ExerciseList;
