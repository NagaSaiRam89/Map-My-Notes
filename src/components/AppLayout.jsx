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
  const { driveConnected, login, logout } = useAuth();// Get login status and function

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="flex justify-between items-center px-6 py-4 ...">
        {/* ... */}
        <div className="flex gap-2 items-center">
          {driveConnected ? (
             // ✅ Show a Logout button when connected
             <button onClick={() => logout()} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
               Logout
             </button>
          ) : (
            <button onClick={() => login()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Connect Google Drive
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-4 px-6 py-2 border-b bg-white">
        {tabs.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`py-2 px-4 rounded-t-md font-medium ${
              location.pathname.startsWith(path) // Use startsWith for dynamic routes
                ? 'border-b-2 border-purple-600 text-purple-700'
                : 'text-gray-600 hover:text-purple-700'
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