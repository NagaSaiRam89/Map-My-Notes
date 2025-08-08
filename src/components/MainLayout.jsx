// src/components/MainLayout.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MainLayout = ({ children }) => {
  const { isSignedIn, signInWithGoogle, signOut, clearAllData, importData, exportData } = useAuth();

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b shadow bg-white">
        <div className="flex items-center gap-2 text-2xl font-semibold text-purple-600">
          🧠 Map My Notes
        </div>
        <div className="flex gap-3">
          {isSignedIn ? (
            <button className="btn" onClick={signOut}>🔓 Logout</button>
          ) : (
            <button className="btn" onClick={signInWithGoogle}>🔐 Google Login</button>
          )}
          <button className="btn" onClick={exportData}>⬇️ Export</button>
          <button className="btn" onClick={importData}>⬆️ Import</button>
          <button
            className="btn bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              clearAllData();
              toast.success('Storage cleared');
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 border-r p-4 flex flex-col gap-3 bg-gray-50">
          <NavLink to="/" className="nav-link" end>📝 Notes</NavLink>
          <NavLink to="/concept-map" className="nav-link">🧩 Concept Map</NavLink>
          <NavLink to="/spaced-learning" className="nav-link">💡 Spaced Learning</NavLink>
          <NavLink to="/daily-gratitude" className="nav-link">❤️ Daily Gratitude</NavLink>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
