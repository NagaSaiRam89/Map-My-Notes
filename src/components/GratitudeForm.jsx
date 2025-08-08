import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function GratitudeForm({ onSubmit, initialData }) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
  
    useEffect(() => {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
      }
    }, [initialData]);
  
    const handleSave = () => {
      if (!title.trim()) return;
  
      const updatedEntry = {
        id: initialData?.id || uuidv4(),
        date: initialData?.date || new Date().toISOString().split('T')[0],
        title,
        description,
        createdAt: initialData?.createdAt || new Date().toISOString(),
      };
  
      onSubmit(updatedEntry);
      setTitle('');
      setDescription('');
    };
  

  return (
    <div className="bg-pink-50 p-4 rounded-md mb-6">
      <h3 className="font-semibold text-lg mb-2">What are you grateful for today?</h3>
      <input
        type="text"
        placeholder="Something you're thankful for..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />
      <textarea
        placeholder="Why are you grateful for it?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-3"
        rows={3}
      />
      <button
        onClick={handleSave}
        className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-4 py-2 rounded"
        >
        {initialData ? 'Save Changes' : "Add Today's Gratitude"}
        </button>

    </div>
  );
}
