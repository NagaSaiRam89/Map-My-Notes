import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

// The tabs paths should match your App.js routes exactly
const tabs = [
  { path: '/notes', label: 'Notes' },
  { path: '/concept-map', label: 'Concept Map' },
  { path: '/spaced-learning', label: 'Spaced Learning' },
  { path: '/daily-gratitude', label: 'Daily Gratitude' },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  const { driveConnected, login, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span role="img" aria-label="brain">🧠</span> Map My Notes
        </h1>
        <div>
          {driveConnected ? (
             <button onClick={() => logout()} className="bg-danger text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-red-700 transition">
               Logout
             </button>
          ) : (
            <button onClick={() => login()} className="bg-primary text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-purple-700 transition">
              Connect Google Drive
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 px-6 bg-white border-b">
        {tabs.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`py-3 px-2 text-sm font-semibold transition ${
              location.pathname.startsWith(path)
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-primary'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Page Content */}
      <main className="p-6">{children}</main>
    </div>
  );
}