/* global gapi */
import toast from 'react-hot-toast';

// --- GAPI Client Initialization ---
let gapiInitialized = false;
export const initGapiClient = (accessToken) =>
  new Promise((resolve, reject) => {
    if (gapiInitialized && gapi.auth) {
      gapi.auth.setToken({ access_token: accessToken });
      return resolve();
    }
    if (!window.gapi) return reject(new Error("GAPI client not loaded"));
    
    window.gapi.load('client', async () => {
      try {
        await gapi.client.load('drive', 'v3');
        gapi.auth.setToken({ access_token: accessToken });
        gapiInitialized = true;
        resolve();
      } catch (err) {
        console.error("Error initializing GAPI client:", err);
        reject(err);
      }
    });
  });

// --- Core Folder & File Management ---
const FOLDER_CACHE = {};
async function ensureFolderByPath(path) {
  if (FOLDER_CACHE[path]) return FOLDER_CACHE[path];
  const parts = path.split('/');
  let parentId = 'root';
  for (const part of parts) {
    const res = await gapi.client.drive.files.list({
      q: `name='${part}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      fields: 'files(id)',
    });
    if (res.result.files.length > 0) {
      parentId = res.result.files[0].id;
    } else {
      const folder = await gapi.client.drive.files.create({
        resource: { name: part, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
        fields: 'id',
      });
      parentId = folder.result.id;
    }
  }
  FOLDER_CACHE[path] = parentId;
  return parentId;
}

async function findFileInFolder(fileName, folderId) {
    const res = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
        fields: 'files(id, name)',
    });
    return res.result.files.length > 0 ? res.result.files[0] : null;
}

async function getFileContent(fileId) {
    const res = await gapi.client.drive.files.get({ fileId, alt: 'media' });
    return res.result;
}

async function saveFileContent(fileId, data) {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: JSON.stringify(data, null, 2),
    });
}

async function createInitialFile(fileName, folderId, initialContent = '[]') {
  const metadata = { name: fileName, mimeType: 'application/json', parents: [folderId] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([initialContent], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ Authorization: 'Bearer ' + gapi.auth.getToken().access_token }),
    body: form,
  });
  const result = await res.json();
  return result.id;
}

// ========================================================================
// Concept Map Utilities
// ========================================================================
const MAPS_PATH = 'Map My Notes/ConceptMaps';

export async function getAllMaps() {
  const folderId = await ensureFolderByPath(MAPS_PATH);
  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
    fields: 'files(id, name)',
  });
  return res.result.files || [];
}

export async function loadMapFromDrive(fileId) {
  if (!fileId) return { title: 'New Map', nodes: [], edges: [] };
  const res = await gapi.client.drive.files.get({ fileId, alt: 'media' });
  try {
    const data = res.result;
    return data && typeof data === 'object' ? data : { title: '', nodes: [], edges: [] };
  } catch (e) {
    return { title: '', nodes: [], edges: [] };
  }
}

export async function saveMapToDrive(fileId, mapData) {
  await saveFileContent(fileId, mapData);
}

export async function createNewMap(title) {
  const folderId = await ensureFolderByPath(MAPS_PATH);
  const fileMetadata = { name: title, mimeType: 'application/json', parents: [folderId] };
  
  const file = await gapi.client.drive.files.create({
    resource: fileMetadata,
    fields: 'id, name',
  });

  const newMap = { title, nodes: [], edges: [] };
  await saveMapToDrive(file.result.id, newMap);

  return { id: file.result.id, name: file.result.name };
}

// ========================================================================
// Notes Utilities
// ========================================================================
const NOTES_PATH = 'Map My Notes/Notes';
async function getNotesFileId() {
  const folderId = await ensureFolderByPath(NOTES_PATH);
  let file = await findFileInFolder('notes.json', folderId);
  if (file) return file.id;
  return await createInitialFile('notes.json', folderId, '[]');
}

export async function loadNotesFromDrive() {
  const fileId = await getNotesFileId();
  const data = await getFileContent(fileId);
  return Array.isArray(data) ? data : [];
}

export async function saveNotesToDrive(notes) {
  try {
    const fileId = await getNotesFileId();
    await saveFileContent(fileId, notes);
    toast.success('Notes Saved!');
  } catch (error) {
    const errorMessage = error.result?.error?.message || "Could not save notes.";
    console.error("❌ FAILED TO SAVE NOTES:", error);
    toast.error(errorMessage);
  }
}

// ========================================================================
// Gratitude Utilities
// ========================================================================
const GRATITUDE_PATH = 'Map My Notes/Gratitude';
async function getGratitudeFileId() {
  const folderId = await ensureFolderByPath(GRATITUDE_PATH);
  let file = await findFileInFolder('gratitude_entries.json', folderId);
  if (file) return file.id;
  return await createInitialFile('gratitude_entries.json', folderId, '[]');
}

export async function loadGratitudeEntries() {
  const fileId = await getGratitudeFileId();
  const data = await getFileContent(fileId);
  return Array.isArray(data) ? data : [];
}

export async function saveGratitudeEntries(entries) {
  try {
    const fileId = await getGratitudeFileId();
    await saveFileContent(fileId, entries);
    toast.success('Gratitude Entries Saved!');
  } catch (error) {
    const errorMessage = error.result?.error?.message || "Could not save entries.";
    console.error("❌ FAILED TO SAVE GRATITUDE:", error);
    toast.error(errorMessage);
  }
}

// ========================================================================
// Spaced Repetition Utilities
// ========================================================================
const SPACED_REP_PATH = 'Map My Notes/SpacedRep';
async function getSpacedRepFileId(fileName) {
  const folderId = await ensureFolderByPath(SPACED_REP_PATH);
  let file = await findFileInFolder(fileName, folderId);
  if (file) return file.id;
  
  const initialContent = fileName === 'reviewStreak.json' ? '{}' : '[]';
  return await createInitialFile(fileName, folderId, initialContent);
}

export async function loadFlashcards() {
    const fileId = await getSpacedRepFileId('flashcards.json');
    const data = await getFileContent(fileId);
    return Array.isArray(data) ? data : [];
}

export async function saveFlashcards(cards) {
  try {
    const fileId = await getSpacedRepFileId('flashcards.json');
    await saveFileContent(fileId, cards);
    toast.success('Flashcards Saved!');
  } catch(error) {
    const errorMessage = error.result?.error?.message || "Could not save flashcards.";
    console.error("❌ FAILED TO SAVE FLASHCARDS:", error);
    toast.error(errorMessage);
  }
}

export async function loadStreak() {
    const fileId = await getSpacedRepFileId('reviewStreak.json');
    const data = await getFileContent(fileId);
    return data && typeof data === 'object' ? data : {};
}

export async function saveStreak(data) {
  try {
    const fileId = await getSpacedRepFileId('reviewStreak.json');
    await saveFileContent(fileId, data);
  } catch(error) {
    console.error("❌ FAILED TO SAVE STREAK:", error);
  }
}

// ========================================================================
// Legacy / Dashboard Utilities (for backwards compatibility)
// ========================================================================
export const ensureAppFolder = () => ensureFolderByPath('Map My Notes');

export const listFilesInFolder = async () => {
    const folderId = await ensureAppFolder();
    const res = await gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
        fields: 'files(id, name, modifiedTime)',
        orderBy: 'modifiedTime desc',
    });
    return res.result.files;
};

export async function loadFromDrive(fileName) {
  const folderId = await ensureAppFolder();
  const file = await findFileInFolder(fileName, folderId);
  if (!file) return null;

  const content = await getFileContent(file.id);
  return JSON.stringify(content); // Original function returned a raw string
}

export async function saveToDrive(jsonData, fileName) {
    const folderId = await ensureAppFolder();
    let file = await findFileInFolder(fileName, folderId);
    let fileId;

    if (file) {
        fileId = file.id;
    } else {
        fileId = await createInitialFile(fileName, folderId, JSON.stringify(jsonData));
        return; // createInitialFile already sets the content
    }
    // If file already exists, update its content
    await saveFileContent(fileId, jsonData);
}

export const deleteMapFile = (fileId) => gapi.client.drive.files.delete({ fileId });
export const loadMapFile = loadMapFromDrive; // Alias
export const loadFlashcardsFromDrive = loadFlashcards; // Alias
export const getAllNotes = loadNotesFromDrive; // Alias