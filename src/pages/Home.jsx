
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Welcome to Map My Notes 🧠</h1>
      <p className="mb-4">Your personalized space to take notes, map concepts, review flashcards, and track gratitude.</p>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => navigate('/daily-gratitude')}
          className="btn bg-pink-500 hover:bg-pink-600 text-white"
        >
          ❤️ Start Daily Gratitude
        </button>
        <button
          onClick={() => navigate('/concept-map')}
          className="btn bg-blue-500 hover:bg-blue-600 text-white"
        >
          🧩 Open Concept Map
        </button>
        <button
          onClick={() => navigate('/spaced-learning')}
          className="btn bg-green-500 hover:bg-green-600 text-white"
        >
          💡 Spaced Learning
        </button>
      </div>
      </div>
        );
};

export default Home;
