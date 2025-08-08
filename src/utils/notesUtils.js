import { loadFromDrive, saveToDrive } from './GoogleDriveService';
import { gapi } from 'gapi-script';


const FILE_NAME = 'notes.json';

export async function loadNotesFromDrive() {
  const data = await loadFromDrive(FILE_NAME);
  try {
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : []; // Ensure it’s an array
  } catch (err) {
    console.error('❌ Failed to parse notes.json:', err, 'Raw data:', data);
    return [];
  }
}


export async function saveNotesToDrive(notes) {
  await saveToDrive(notes, FILE_NAME);
}

// notesUtils.js

export async function createNoteWithKeyword(keyword) {
  const existingNotes = await loadNotesFromDrive();

  const newNote = {
    id: Date.now().toString(),
    title: `Note for ${keyword}`,
    content: '',
    userKeywords: [keyword],
    createdAt: new Date().toISOString(),
  };

  const updated = [newNote, ...existingNotes];
  await saveNotesToDrive(updated);
  return newNote;
}

// notesUtils.js

export function openNote(noteId) {
  localStorage.setItem('activeNoteId', noteId);
}




export async function getNoteById(fileId) {
  try {
    await gapi.client.load('drive', 'v3');
    
    const res = await gapi.client.drive.files.get({
      fileId,
      alt: 'media', // fetch the actual file content
    });

    const noteData = res.result;

    // Basic validation
    if (
      noteData &&
      typeof noteData === 'object' &&
      noteData.id &&
      noteData.title &&
      'content' in noteData
    ) {
      return noteData;
    } else {
      console.warn('⚠️ Invalid note format in getNoteById:', noteData);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching note:', error.message);
    return null;
  }
}
