// components/GratitudeEntry.jsx
import React from 'react';

export default function GratitudeEntry({ entry, onEdit, onDelete }) {
  return (
    <div className="border rounded-md p-4 mb-4 bg-white shadow">
      <div className="text-sm text-gray-500 mb-1">{entry.date}</div>
      <h3 className="text-lg font-semibold">{entry.title}</h3>
      <p className="text-gray-700 mt-1">{entry.description}</p>
      <div className="flex justify-end mt-3 space-x-2">
        <button
          onClick={() => onEdit(entry)}
          className="text-blue-500 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
