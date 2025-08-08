import React from 'react';

export default function NoteList({ notes, activeId, onSelect, onAdd, onDelete }) {
  return (
    <div className="w-64 border-r p-3 space-y-2">
      <button onClick={onAdd} className="w-full bg-blue-600 text-white py-1 rounded">+ New Note</button>
      {notes.map((note) => (
        <div
          key={note.id}
          className={`p-2 rounded cursor-pointer ${note.id === activeId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onClick={() => onSelect(note)}
        >
          {note.title || 'Untitled Note'}
          <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="ml-2 text-red-500">🗑️</button>
        </div>
      ))}
    </div>
  );
}
