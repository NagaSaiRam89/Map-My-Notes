// components/AppLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Notes' },
  { path: '/concept-map', label: 'Concept Map' },
  { path: '/spaced-learning', label: 'Spaced Learning' },
  { path: '/daily-gratitude', label: 'Daily Gratitude' },
];

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <span role="img" aria-label="brain">🧠</span> Map My Notes
        </h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary">Google Login</button>
          <button className="btn btn-secondary">Export</button>
          <button className="btn btn-secondary">Import</button>
          <button className="btn btn-danger">Clear</button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-4 px-6 py-2 border-b">
        {tabs.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`py-2 px-4 rounded-md font-medium ${
              location.pathname === path
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
