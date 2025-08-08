import React, { useState, useEffect } from 'react';
import NoteEditor from '../components/NoteEditor';
import NoteList from '../components/NoteList';
import { saveNotesToDrive } from '../utils/GoogleDriveService';
import AppLayout from '../components/AppLayout';

export default function NotesPage({ notes, setNotes }) { 
  const [activeNote, setActiveNote] = useState(null);

  useEffect(() => {
    if (notes && notes.length > 0) {
      const lastOpenedId = localStorage.getItem('activeNoteId');
      const found = notes.find(n => n.id === lastOpenedId);
      setActiveNote(found || notes[0]);
    } else {
      setActiveNote(null);
    }
  }, [notes]);

  const handleNoteChange = (updatedNote) => {
    const updatedNotes = notes.map(n => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(updatedNotes);
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
    setNotes(updatedNotes);
    setActiveNote(newNote);
    saveNotesToDrive(updatedNotes);
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    setActiveNote(updatedNotes[0] || null);
    saveNotesToDrive(updatedNotes);
  };

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-lg shadow-md border border-gray-200">
        <NoteList
          notes={notes}
          activeId={activeNote?.id}
          onSelect={setActiveNote}
          onAdd={handleAddNote}
          onDelete={handleDeleteNote}
        />
        <div className="flex-1 border-l border-gray-200">
          {activeNote ? (
            <NoteEditor
              key={activeNote.id}
              note={activeNote}
              onChange={handleNoteChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a note from the list, or create a new one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}