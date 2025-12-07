// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Use Routes instead of Switch
import './App.css';
import Login from './components/Login';
import ExerciseList from './components/ExerciseList';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Use Routes instead of Switch */}
        <Routes>
          {/* Define routes with element instead of component */}
          <Route path="/" element={<Login />} />
          <Route path="/exercises" element={<ExerciseList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
