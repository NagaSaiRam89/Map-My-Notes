import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import NoteEditor from '../components/NoteEditor';
import { getAllNotes } from '../utils/GoogleDriveService';
import { saveNotesToDrive } from '../utils/GoogleDriveService'; 
import AppLayout from '../components/AppLayout';

export default function NoteEditorPage() {
  const { noteId } = useParams();
  const [searchParams] = useSearchParams();
  const mapId = searchParams.get('mapId');

  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNote() {
      try {
        const notes = await getAllNotes();
        const matched = notes.find((n) => n.id === noteId);
        if (matched) {
          setNote(matched);
        }
      } catch (err) {
        console.error('Error loading notes:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [noteId]);

  const handleNoteChange = (updatedNote) => {
    setNote(updatedNote);
  };

  const handleSave = async (updatedNote) => {
    await saveNotesToDrive(updatedNote);
    alert(' Note saved');
  };

  if (loading) return <div className="p-4">Loading note...</div>;
  if (!note) return <div className="p-4 text-red-500">Note not found.</div>;

  return (
    <AppLayout>
    <div className="h-screen overflow-y-auto p-4">
      {mapId && (
        <button
          onClick={() => navigate(`/concept-map/${mapId}`)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ← Back to Concept Map
        </button>
      )}

      <NoteEditor
        note={note}
        onChange={handleNoteChange}
        onSave={handleSave}
      />
    </div>
    </AppLayout>
  );
}
