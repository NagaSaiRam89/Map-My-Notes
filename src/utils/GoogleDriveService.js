/* global gapi */

let gapiInitialized = false;
let folderId = null;
let currentFileId = null;

const FOLDER_NAME = 'Map My Notes';

export const initGapiClient = (accessToken) =>
  new Promise((resolve, reject) => {
    if (gapiInitialized) return resolve();

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
