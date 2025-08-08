import { gapi } from 'gapi-script';

let gapiInitialized = false;
let folderId = null;
let currentFileId = null;

const FOLDER_NAME = 'Map My Notes';

export const initGapiClient = (accessToken) =>
  new Promise((resolve, reject) => {
    if (gapiInitialized) return resolve();

    if (!window.gapi) {
      return reject(new Error("GAPI not loaded"));
    }
    
    window.gapi.load('client', async () => {
      try {
        await gapi.client.load('drive', 'v3');
        await gapi.client.init({
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        gapi.auth.setToken({ access_token: accessToken });
        gapiInitialized = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });

export const ensureAppFolder = async () => {
  const res = await gapi.client.drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (res.result.files.length > 0) {
    folderId = res.result.files[0].id;
  } else {
    const folder = await gapi.client.drive.files.create({
      resource: {
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    folderId = folder.result.id;
  }

  return folderId;
};

// List all map files in the folder
export const listFilesInFolder = async () => {
  if (!folderId) await ensureAppFolder();

  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and trashed=false and mimeType='application/json'`,
    fields: 'files(id, name, modifiedTime)',
    orderBy: 'modifiedTime desc',
  });

  return res.result.files; // [{ id, name, modifiedTime }]
};

// Save or update a file with given name
export const saveToDrive = async (jsonData, fileName = 'untitled-map.json') => {
  const fileContent = JSON.stringify(jsonData);
  const blob = new Blob([fileContent], { type: 'application/json' });

  // Find existing file by name
  const existing = await gapi.client.drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });

  const existingId = existing.result.files[0]?.id;
  currentFileId = existingId || currentFileId;

  const form = new FormData();
  form.append(
    'metadata',
    new Blob(
      [JSON.stringify({ name: fileName, mimeType: 'application/json', parents: existingId ? undefined : [folderId] })],
      { type: 'application/json' }
    )
  );
  form.append('file', blob);

  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const method = existingId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: new Headers({ Authorization: 'Bearer ' + gapi.auth.getToken().access_token }),
    body: form,
  });

  const result = await res.json();
  currentFileId = result.id;
  return result;
};

// Load a map by file ID
export const loadMapFile = async (fileId) => {
  const res = await gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });
  currentFileId = fileId;
  return res.result;
};


//Delete a map file by ID
export const deleteMapFile = async (fileId) => {
  try {
    await gapi.client.drive.files.delete({
      fileId,
    });
    return true;
  } catch (err) {
    console.error('Delete failed:', err);
    return false;
  }
};

// Gratitude entries management


let gratitudeFileId = null;

export async function saveGratitudeEntries(entries) {
  const folderId = await ensureAppFolder();

  // Check if file already exists
  let file = await findExistingFile('gratitude_entries.json');
  if (!file) {
    const createRes = await gapi.client.drive.files.create({
      resource: {
        name: 'gratitude_entries.json',
        mimeType: 'application/json',
        parents: [folderId],
      },
      fields: 'id',
    });
    file = createRes.result;
  }

  gratitudeFileId = file.id;

  // Upload the updated JSON
  await gapi.client.request({
    path: `/upload/drive/v3/files/${file.id}`,
    method: 'PATCH',
    params: { uploadType: 'media' },
    body: JSON.stringify(entries),
  });
}

// Finds file by name in user's Drive app folder
export async function findExistingFile(fileName) {
  const response = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = response.result.files;
  return files && files.length > 0 ? files[0] : null;
}


export async function loadGratitudeEntries() {
  await ensureAppFolder();

  const file = await findExistingFile('gratitude_entries.json');
  if (!file) return [];

  gratitudeFileId = file.id;
  const res = await gapi.client.drive.files.get({
    fileId: file.id,
    alt: 'media'
  });
  return JSON.parse(res.body);
}

export async function deleteGratitudeEntry(idToDelete) {
  if (!gratitudeFileId) return;

  const currentData = await loadGratitudeEntries();
  const updatedData = currentData.filter(e => e.id !== idToDelete);

  await gapi.client.request({
    path: `/upload/drive/v3/files/${gratitudeFileId}`,
    method: 'PATCH',
    params: { uploadType: 'media' },
    body: JSON.stringify(updatedData),
  });
}

export async function loadStreak() {
  const content = await loadFromDrive('review-streak.json');
  return content ? JSON.parse(content) : {};
}

export async function saveStreak(data) {
  await saveToDrive(data, 'review-streak.json');
}

export async function loadFromDrive(filename) {
  const file = await findExistingFile(filename);
  if (!file) return null;

  const response = await gapi.client.drive.files.get({
    fileId: file.id,
    alt: 'media',
  });

  return response.body;
}

export async function loadFlashcardsFromDrive() {
  const raw = await loadFromDrive('flashcards.json');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : []; // ✅ ensures always array
  } catch (e) {
    console.error('Invalid JSON in flashcards.json:', e);
    return [];
  }
}
 
// Placeholder to avoid import error
export function saveConceptMapToDrive(conceptMap) {
  console.log("Saving concept map to Google Drive (not implemented):", conceptMap);
}



// Ensures a dedicated folder exists for concept maps
// export async function ensureConceptFolder() {
//   const folderName = 'MapMyNotes_ConceptMaps';

//   const res = await gapi.client.drive.files.list({
//     q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
//     fields: 'files(id)',
//     spaces: 'drive',
//   });

//   if (res.result.files?.length > 0) {
//     return res.result.files[0].id;
//   }

//   const createRes = await gapi.client.drive.files.create({
//     resource: {
//       name: folderName,
//       mimeType: 'application/vnd.google-apps.folder',
//     },
//     fields: 'id',
//   });

//   return createRes.result.id;
// }

// // Loads raw content from Drive by filename
// export async function loadMapFromDrive(fileId) {
//   try {
//     const file = await gapi.client.drive.files.get({
//       fileId,
//       alt: 'media',
//     });

//     return file.result; // This should contain { id, title, nodes, edges }
//   } catch (error) {
//     console.error('Error loading map:', error);
//     throw error;
//   }
// }


// // Save or update a concept map to Drive
// export async function saveMapToDrive(fileId, mapData) {
//   try {
//     console.log("saveMapToDrive called with:", { fileId, mapData });

//   if (!fileId || !(mapData?.title || mapData?.name)) {
//     throw new Error("Missing fileId or mapData.name");
//   }

//   const fileContent = JSON.stringify(mapData);
//   const blob = new Blob([fileContent], { type: 'application/json' });

//   await gapi.client.request({
//     path: `/upload/drive/v3/files/${fileId}`,
//     method: 'PATCH',
//     params: {
//       uploadType: 'media',
//     },
//     body: blob,
//   });
//   } catch (error) {
//     console.error('Error saving map:', error);
//     throw error;
//   }
// }

// // Create a new map structure and save it
// export async function createNewMap(title) {
//   const folderId = await ensureConceptFolder();

//   const fileMetadata = {
//     name: `${title}.json`,  // ✅ file name
//     mimeType: 'application/json',
//     parents: [folderId],
//   };

//   const file = await gapi.client.drive.files.create({
//     resource: fileMetadata,
//     fields: 'id',
//   });

//   const newMap = {
//     id: file.result.id, // ✅ required
//     title,
//     name: `${title}.json`, // ✅ required
//     nodes: [],
//     edges: [],
//     createdAt: new Date().toISOString(),
//   };

//   await saveMapToDrive(newMap.id, newMap); // ✅ now has both

//   return newMap;
// }



// // List all concept maps saved in Drive
// export async function getAllMaps() {
//   const folderId = await ensureConceptFolder();
//   const res = await gapi.client.drive.files.list({
//     q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
//     fields: 'files(id, name)',
//     spaces: 'drive',
//   });

//   return res.result.files || [];
// }
// export async function listAvailableMaps() {
//   const maps = await getAllMaps();
//   return maps;
// }

// GoogleDriveService.js





// export async function createNewMap(title) {
//   const folderId = await ensureConceptFolder();

//   const fileMetadata = {
//     name: title,
//     mimeType: 'application/json',
//     parents: [folderId],
//   };

//   const initialMap = {
//     title,
//     nodes: [],
//     edges: [],
//     createdAt: new Date().toISOString(),
//   };

//   const file = await gapi.client.drive.files.create({
//     resource: fileMetadata,
//     media: {
//       mimeType: 'application/json',
//       body: JSON.stringify(initialMap),
//     },
//     fields: 'id',
//   });

//   return { ...initialMap, id: file.result.id };
// }

// GoogleDriveService.js

let conceptFolderId = null;

export async function ensureConceptFolder() {
  if (conceptFolderId) return conceptFolderId;

  const response = await gapi.client.drive.files.list({
    q: "mimeType='application/vnd.google-apps.folder' and name='MapMyNotes_ConceptMaps' and trashed = false",
    fields: 'files(id, name)',
  });

  if (response.result.files && response.result.files.length > 0) {
    conceptFolderId = response.result.files[0].id;
  } else {
    const folderMetadata = {
      name: 'MapMyNotes_ConceptMaps',
      mimeType: 'application/vnd.google-apps.folder',
    };

    const createResponse = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id',
    });

    conceptFolderId = createResponse.result.id;
  }

  return conceptFolderId;
}

export async function getAllMaps() {
  await ensureConceptFolder();

  const response = await gapi.client.drive.files.list({
    q: `'${conceptFolderId}' in parents and mimeType='application/json' and trashed = false`,
    fields: 'files(id, name)',
  });

  return response.result.files;
}

export async function createNewMap(title) {
  await ensureConceptFolder();

  const fileMetadata = {
    name: title,
    mimeType: 'application/json',
    parents: [conceptFolderId],
  };

  const createResponse = await gapi.client.drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });

  const fileId = createResponse.result.id;

  const defaultMap = {
    title,
    nodes: [],
    edges: [],
  };

  await gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    params: { uploadType: 'media' },
    body: JSON.stringify(defaultMap),
  });

  return { id: fileId, title };
}

export async function loadMapFromDrive(fileId) {
  if (!fileId) throw new Error("No fileId provided");
  const file = await gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });
  if (!file.body || file.body === '{}') {
    console.warn('Empty map detected. Returning default structure.');
    return { title: '', nodes: [], edges: [] }; // 🛠 default
  }
  return JSON.parse(file.body);
}


export async function saveMapToDrive(fileId, mapData) {
  try {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: JSON.stringify(mapData),
    });
  } catch (error) {
    console.error('Failed to save map to Drive:', error);
  }
}

export async function deleteMapFromDrive(fileId) {
  if (!fileId) throw new Error("Missing fileId to delete");
  await gapi.client.drive.files.delete({ fileId });
}


export async function getAllNotes(lightOnly = true) {
  const noteFolderId = await ensureAppFolder();

  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/json' and trashed=false`,
    fields: 'files(id, name, createdTime)',
  });

  const files = res.result.files;

  // ✅ If only basic metadata is needed (e.g., for dropdown)
  if (lightOnly) {
    const validMetaNotes = [];

    for (const file of files) {
      try {
        const contentRes = await gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media',
        });

        const noteData = contentRes.result;

        if (
          noteData &&
          typeof noteData === 'object' &&
          !Array.isArray(noteData) &&
          noteData.title &&
          noteData.content
        ) {
          validMetaNotes.push({
            id: file.id,
            title: noteData.title,
            createdTime: file.createdTime,
          });
        }
      } catch (err) {
        console.warn(`⚠️ Skipping file ${file.name}: ${err.message}`);
      }
    }

    return validMetaNotes;
  }

  // ✅ Else, fetch full notes
  const validNotes = [];

  for (const file of files) {
    try {
      const contentRes = await gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media',
      });

      const noteData = contentRes.result;

      if (
        noteData &&
        typeof noteData === 'object' &&
        !Array.isArray(noteData) &&
        noteData.title &&
        noteData.content
      ) {
        validNotes.push({
          id: file.id,
          ...noteData,
        });
      } else if (Array.isArray(noteData)) {
        noteData.forEach((note, idx) => {
          if (
            note &&
            typeof note === 'object' &&
            note.title &&
            note.content
          ) {
            validNotes.push(note);
          } else {
            console.warn(`⛔ Skipped invalid note in array at index ${idx} in file: ${file.name}`);
          }
        });
      } else {
        console.warn(`⚠️ Skipped invalid note file: ${file.name}`);
        console.log('🔍 Raw content:', noteData);
      }
    } catch (err) {
      console.warn(`❌ Failed to parse ${file.name}: ${err.message}`);
    }
  }

  return validNotes;
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
