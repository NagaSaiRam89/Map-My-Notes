import React, { useState, useEffect } from 'react';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import { saveNotesToDrive } from '../utils/GoogleDriveService'; // ✅ Changed path
import AppLayout from '../components/AppLayout';

// ✅ FIX: Receive notes and setNotes as props from App.js
export default function NotesPage({ notes, setNotes }) { 
  const [activeNote, setActiveNote] = useState(null);

  // ✅ FIX: This useEffect now just sets the active note from the props
  useEffect(() => {
    // When the notes prop updates (e.g., after initial load), set the active note.
    if (notes && notes.length > 0) {
      const lastOpenedId = localStorage.getItem('activeNoteId');
      const found = notes.find(n => n.id === lastOpenedId);
      setActiveNote(found || notes[0]);
    } else {
      setActiveNote(null);
    }
  }, [notes]); // Run when the notes prop changes

  const handleNoteChange = (updatedNote) => {
    const updatedNotes = notes.map(n => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(updatedNotes); // Update the state in App.js
    setActiveNote(updatedNote);
    saveNotesToDrive(updatedNotes); 
  };

  const handleAddNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      userKeywords: [],
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes); // Update the state in App.js
    setActiveNote(newNote);
    saveNotesToDrive(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes); // Update the state in App.js
    setActiveNote(updatedNotes[0] || null);
    saveNotesToDrive(updatedNotes);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-120px)]">
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
              key={activeNote.id}
              note={activeNote}
              onChange={handleNoteChange}
            />
          ) : (
            <div className="p-4 text-gray-500">Select or create a note.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}