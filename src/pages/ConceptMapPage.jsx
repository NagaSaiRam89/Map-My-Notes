import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ConceptMap from '../components/ConceptMap';
import AppLayout from '../components/AppLayout';
import {
  getAllMaps,
  createNewMap,
  loadMapFromDrive,
  saveMapToDrive,
} from '../utils/GoogleDriveService';

// ✅ FIX: Receive the 'notes' array as a prop from App.js
export default function ConceptMapPage({ notes }) { 
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(localStorage.getItem('selectedMapId') || '');
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the list of available maps
  useEffect(() => {
    async function loadMapList() {
      const allMaps = await getAllMaps();
      setMaps(allMaps);
    }
    loadMapList();
  }, []);

  // Load the data for the selected map
  useEffect(() => {
    async function loadSelectedMap() {
      if (selectedMapId) {
        setLoading(true);
        const data = await loadMapFromDrive(selectedMapId);
        setMapData(data);
        setLoading(false);
      }
    }
    loadSelectedMap();
  }, [selectedMapId]);

  const handleMapChange = (e) => {
    const mapId = e.target.value;
    setSelectedMapId(mapId);
    localStorage.setItem('selectedMapId', mapId);
  };

  const handleCreateMap = async () => {
    const title = prompt('Enter new map title:');
    if (!title || !title.trim()) return;
    const newMap = await createNewMap(title);
    setMaps(prev => [...prev, newMap]); // Add new map to the list
    setSelectedMapId(newMap.id); // Automatically select the new map
  };

  const handleSave = async (updatedMapData) => {
    if (!selectedMapId) return;
    await saveMapToDrive(selectedMapId, updatedMapData);
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">🧠 Concept Map</h2>
        <div className="flex gap-2 items-center">
          <select className="border p-2 rounded" value={selectedMapId} onChange={handleMapChange}>
            <option value="">Select a map</option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>{map.name}</option>
            ))}
          </select>
          <button onClick={handleCreateMap} className="bg-green-500 text-white px-4 py-2 rounded">
            + Create New Map
          </button>
        </div>

        {loading && <div>Loading Map...</div>}

        {!loading && selectedMapId && mapData && (
          <ReactFlowProvider>
            <ConceptMap
              key={selectedMapId}
              initialMapData={mapData}
              notes={notes} // ✅ Pass the notes prop down to the canvas component
              onSave={handleSave}
              selectedMapId={selectedMapId}
            />
          </ReactFlowProvider>
        )}
      </div>
    </AppLayout>
  );
}