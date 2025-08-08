// import React from 'react';
// import { Link } from 'react-router-dom';
// import MainLayout from '../components/MainLayout';
// export default function Home() {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Map My Notes</h1>
//       <Link to="/dashboard" className="text-blue-500 underline">
//         Go to Dashboard
//       </Link>
//     </div>
//   );
// }
      // <Link to="/MainLayout" className="text-blue-500 underline">
      //   Go to Dashboard
      // </Link>
// src/pages/Home.jsx
// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/MainLayout';

const Home = () => {
  const navigate = useNavigate();

  return (
    // <MainLayout>
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