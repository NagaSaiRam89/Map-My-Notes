import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Map My Notes</h1>
      <Link to="/dashboard" className="text-blue-500 underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
