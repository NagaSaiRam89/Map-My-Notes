/* global gapi */


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
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
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
      console.log('Auto-saved map ');
    }, 60000); // every 60 seconds
  
    return () => clearInterval(interval);
  }, [driveConnected, selectedMap, availableMaps]);

  const { setAccessToken } = useAuth();

  const handleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive.file',
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
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
    alert('Saved to Google Drive ');
  };

  const handleLoad = async () => {
    const cloudData = await loadMapFile(selectedMap);
    canvasRef.current.setMapData(cloudData);
    alert('Loaded from Drive ');
  };

  
  

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <div className="flex gap-4">
        <button onClick={handleLogin} className="bg-blue-600 text-white px-3 py-1 rounded">
           Connect Google Drive
        </button>
        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded">
           Save Map
        </button>
        <button onClick={handleLoad} className="bg-yellow-500 text-white px-3 py-1 rounded">
           Load Map
        </button>
   

          <button
            onClick={() => navigate('/gratitude')}
            className="bg-pink-600 text-white px-3 py-1 rounded"
          >
            Go to Gratitude Page
          </button>
          <button
            onClick={() => navigate('/spaced')}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Go to Spaced Repetition
          </button>
          <button
            onClick={() => navigate('/notes')}
            className="bg-orange-600 text-white px-3 py-1 rounded"
          >
            Go to Notes
          </button>

          <button
            onClick={() => navigate('/map')}
            className="bg-purple-600 text-white px-3 py-1 rounded"
          >
            go to maps
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
        alert('New map saved ');
      }}
    >
       Create & Save
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
      alert('Map deleted ');
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
