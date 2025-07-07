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

import React, { useState, useRef, useEffect } from 'react';
import MapCanvas from '../components/MapCanvas';
import OCRUpload from '../components/OCRUpload';
import {
  initGapiClient,
  ensureAppFolder,
  saveToDrive,
  listFilesInFolder,
  loadMapFile,
  deleteMapFile,
} from '../utils/GoogleDriveService';
import { useGoogleLogin } from '@react-oauth/google';

export default function Dashboard() {
  const canvasRef = useRef();

  const handleOCRText = (text) => {
    if (canvasRef.current) {
      canvasRef.current.addOCRNode(text);
    }
  };

  const [driveConnected, setDriveConnected] = useState(false);
  const [availableMaps, setAvailableMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [newMapName, setNewMapName] = useState('');
  
  useEffect(() => {
    if (!driveConnected || !selectedMap) return;
  
    const interval = setInterval(async () => {
      const data = canvasRef.current.getMapData();
      await saveToDrive(data, availableMaps.find(m => m.id === selectedMap)?.name);
      console.log('Auto-saved map ✅');
    }, 60000); // every 60 seconds
  
    return () => clearInterval(interval);
  }, [driveConnected, selectedMap, availableMaps]);

  

  const handleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      await initGapiClient(tokenResponse.access_token);
      await ensureAppFolder();
      const maps = await listFilesInFolder();
      setAvailableMaps(maps);
      setDriveConnected(true);
    },
  });
  

  const handleSave = async () => {
    const data = canvasRef.current.getMapData();
    await saveToDrive(data);
    alert('Saved to Google Drive ✅');
  };

  const handleLoad = async () => {
    const cloudData = await loadMapFile(selectedMap);
    canvasRef.current.setMapData(cloudData);
    alert('Loaded from Drive 📥');
  };

  
  

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="flex gap-4">
        <button onClick={handleLogin} className="bg-blue-600 text-white px-3 py-1 rounded">
          🔐 Connect Google Drive
        </button>
        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">
          ☁️ Save Map
        </button>
        <button onClick={handleLoad} className="bg-yellow-500 text-white px-3 py-1 rounded">
          📥 Load Map
        </button>
      </div>
      {driveConnected && (
     <div className="flex gap-4 mt-4 items-center">
     <select
      onChange={async (e) => {
        const fileId = e.target.value;
        const data = await loadMapFile(fileId);
        canvasRef.current.setMapData(data);
        setSelectedMap(fileId);
      }}
      className="border rounded p-1"
    >
      <option value="">-- Select a Map --</option>
      {availableMaps.map((map) => (
        <option key={map.id} value={map.id}>
          {map.name}
        </option>
      ))}
    </select>

    <input
      placeholder="New map name"
      value={newMapName}
      onChange={(e) => setNewMapName(e.target.value)}
      className="border rounded p-1"
    />
    <button
      className="bg-green-600 text-white px-3 py-1 rounded"
      onClick={async () => {
        const data = canvasRef.current.getMapData();
        await saveToDrive(data, newMapName || 'untitled-map.json');
        const updated = await listFilesInFolder();
        setAvailableMaps(updated);
        setNewMapName('');
        alert('New map saved ✅');
      }}
    >
      ➕ Create & Save
    </button>
  </div>
)}

{selectedMap && (
  <button
    className="bg-red-600 text-white px-3 py-1 rounded"
    onClick={async () => {
      const confirm = window.confirm('Delete this map from Drive?');
      if (!confirm) return;
      await deleteMapFile(selectedMap);
      setAvailableMaps(await listFilesInFolder());
      setSelectedMap(null);
      alert('Map deleted ❌');
    }}
  >
    🗑 Delete
  </button>
)}


      <MapCanvas ref={canvasRef} />
      <OCRUpload onTextExtracted={handleOCRText} />
    </div>
  );
}
