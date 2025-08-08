/* global gapi */

let gapiInitialized = false;

export const initGapiIfNeeded = (accessToken) =>
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

const FOLDER_NAME = 'MapMyNotes/Spaced';
const FILE_NAME = 'flashcards.json';

export async function findOrCreateFolder(FOLDER_NAME) {
  const res = await gapi.client.drive.files.list({
    q: `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const folders = res?.result?.files || [];

  if (folders.length > 0) {
    return folders[0].id;
  }

  // Create folder if not found
  const createRes = await gapi.client.drive.files.create({
    resource: {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  });

  return createRes.result.id;
}

async function findOrCreateFlashcardFile(folderId) {
  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name = '${FILE_NAME}' and trashed = false`,
    fields: 'files(id)',
  });

  const existing = res.result.files[0];
  if (existing) return existing.id;

  const createRes = await gapi.client.drive.files.create({
    resource: {
      name: FILE_NAME,
      mimeType: 'application/json',
      parents: [folderId],
    },
    fields: 'id',
  });

  return createRes.result.id;
}



export async function saveFlashcards(cards) {
  const folderId = await findOrCreateFolder(FOLDER_NAME);
  const fileId = await findOrCreateFlashcardFile(folderId);

  const file = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });

  await gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    params: { uploadType: 'media' },
    body: file,
  });
}

export async function loadFlashcards() {
  const folderId = await findOrCreateFolder(FOLDER_NAME);
  const fileId = await findOrCreateFlashcardFile(folderId);

  const res = await gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });

  return res.result;
}

const STREAK_FILE = 'reviewStreak.json';

export async function loadReviewStreak() {
  const folderId = await findOrCreateFolder(FOLDER_NAME);
  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name = '${STREAK_FILE}' and trashed = false`,
    fields: 'files(id)',
  });

  if (!res.result.files[0]) return { reviewStreakCount: 0, lastReviewDate: null };

  const fileId = res.result.files[0].id;
  const data = await gapi.client.drive.files.get({ fileId, alt: 'media' });
  return data.result;
}

export async function saveReviewStreak(data) {
  const folderId = await findOrCreateFolder(FOLDER_NAME);
  const res = await gapi.client.drive.files.list({
    q: `'${folderId}' in parents and name = '${STREAK_FILE}' and trashed = false`,
    fields: 'files(id)',
  });

  const fileId = res.result.files[0]?.id || (
    await gapi.client.drive.files.create({
      resource: {
        name: STREAK_FILE,
        mimeType: 'application/json',
        parents: [folderId],
      },
      fields: 'id',
    })
  ).result.id;

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  await gapi.client.request({
    path: `/upload/drive/v3/files/${fileId}`,
    method: 'PATCH',
    params: { uploadType: 'media' },
    body: blob,
  });
}
