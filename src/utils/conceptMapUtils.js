import { loadFromDrive, saveToDrive } from './GoogleDriveService';

// Load a specific map by filename
export async function loadMapFromDrive(filename = 'conceptMap.json') {
  const raw = await loadFromDrive(filename);
  return raw ? JSON.parse(raw) : { nodes: [], edges: [] };
}

// Save a map to Drive (returns file metadata)
export async function saveMapToDrive(map, fileId = null) {
  const folderId = await ensureConceptFolder();

  if (fileId) {
    // Update existing file
    await window.gapi.client.drive.files.update({
      fileId,
      resource: {
        name: map.title,
      },
    });

    await saveToDrive(map, fileId); // Use your own logic here to save content by ID
    return { id: fileId, name: map.title };
  } else {
    // Create new file
    const createRes = await window.gapi.client.drive.files.create({
      resource: {
        name: map.title,
        mimeType: 'application/json',
        parents: [folderId],
      },
      fields: 'id, name',
    });

    const fileId = createRes.result.id;
    await saveToDrive(map, fileId); // Save content by file ID

    return { id: fileId, name: map.title };
  }
}

// Get all saved concept maps from Drive
export async function getAllMaps() {
  const folderId = await ensureConceptFolder();
  const res = await window.gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  return res.result.files.map(f => ({ id: f.id, name: f.name }));
}

// Ensure the dedicated folder exists or create it
export async function ensureConceptFolder() {
  const folderName = 'MapMyNotes_ConceptMaps';

  const res = await window.gapi.client.drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.result.files && res.result.files.length > 0) {
    return res.result.files[0].id;
  }

  const createRes = await window.gapi.client.drive.files.create({
    resource: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return createRes.result.id;
}

// Create a new map and save it to Drive (returns saved file metadata)
export async function createNewMap(title) {
  const newMap = {
    id: `map-${Date.now()}`,
    title,
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
  };

  const savedFile = await saveMapToDrive(newMap);
  return { ...newMap, id: savedFile.id }; // Ensure returned map includes Drive file ID
}
