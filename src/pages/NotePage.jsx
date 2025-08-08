import React, { useState, useEffect } from 'react';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import { loadNotesFromDrive, saveNotesToDrive } from '../utils/notesUtils';
import AppLayout from '../components/AppLayout';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

// inside NotesPage useEffect

useEffect(() => {
  async function loadNotes() {
    const stored = await loadNotesFromDrive();

    if (!Array.isArray(stored)) {
      console.warn('❗ Invalid notes data loaded:', stored);
      setNotes([]);
      return;
    }

    setNotes(stored);

    const lastOpenedId = localStorage.getItem('activeNoteId');
    const found = stored.find(n => n.id === lastOpenedId);
    setActiveNote(found || stored[0] || null);
  }

  loadNotes();
}, []);


  const handleNoteChange = (updatedNote) => {
    const updated = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    setNotes(updated);
    setActiveNote(updatedNote);
  };

  const handleSave = (noteToSave) => {
    const updated = notes.map(n => n.id === noteToSave.id ? noteToSave : n);
    setNotes(updated);
    saveNotesToDrive(updated);
  };
  

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      userKeywords: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    setActiveNote(newNote);
    saveNotesToDrive(updated);
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    setActiveNote(updated[0] || null);
    saveNotesToDrive(updated);
  };

  return (
    <AppLayout>
    <div className="flex h-screen">
      <NoteList
        notes={notes}
        activeId={activeNote?.id}
        onSelect={setActiveNote}
        onAdd={handleAddNote}
        onDelete={handleDeleteNote}
      />
      <div className="flex-1">
        {activeNote ? (
          <NoteEditor
            note={activeNote}
            onChange={handleNoteChange}
            onSave={handleSave}
          />
        ) : (
          <div className="p-4 text-gray-500">Select or create a note.</div>
        )}
      </div>
    </div>
    </AppLayout>
  );
}
