import React, { useState } from 'react';
export default function MapSelector({ maps, selected, onChange }) {
  const [newName, setNewName] = useState('');
  const handleNew = () => {
    if (newName.trim()) onChange({ id: null, name: newName, nodes: [], edges: [] });
  };

  return (
    <div>
      <h2 className="font-bold mb-2">Concept Map</h2>
      <select
        className="border p-2 rounded w-full"
        value={selected?.id || ''}
        onChange={e => {
          onChange(maps.find(m => m.id === e.target.value));
        }}
      >
        <option value="">-- Select map --</option>
        {maps.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <div className="mt-2 flex gap-2">
        <input
          className="border flex-1 p-1 rounded"
          placeholder="New map name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-2 rounded" onClick={handleNew}>
          Create
        </button>
      </div>
    </div>
  );
}
