// src/pages/ConceptMapPage.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAllMaps,
  createNewMap,
  loadMapFromDrive,
  saveMapToDrive,
  ensureConceptFolder,
} from '../utils/GoogleDriveService';
import ConceptMap from '../components/ConceptMap';
import AppLayout from '../components/AppLayout';

const ConceptMapPage = () => {
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(localStorage.getItem('selectedMapId') || '');
  const [mapData, setMapData] = useState(null);

  const loadMapList = useCallback(async () => {
    await ensureConceptFolder();
    const allMaps = await getAllMaps();
    setMaps(allMaps);
  }, []);

  useEffect(() => {
    loadMapList();
  }, [loadMapList]);

  useEffect(() => {
    const loadSelectedMap = async () => {
      if (!selectedMapId) {
        console.warn('No map selected. Skipping load.');
        return;
      }
      try {
        const data = await loadMapFromDrive(selectedMapId);
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid or empty map data');
        }
        setMapData(data);
      } catch (err) {
        console.error('Failed to load selected map:', err);
        setMapData({ title: '', nodes: [], edges: [] }); // fallback
      }
    };

    loadSelectedMap();
  }, [selectedMapId]);

  const handleMapChange = (e) => {
    const mapId = e.target.value;
    setSelectedMapId(mapId);
    localStorage.setItem('selectedMapId', mapId);
  };

  const handleCreateMap = async () => {
    const title = prompt('Enter new map title:');
    if (!title) return;
    const newMap = await createNewMap(title);
    await loadMapList();
    setSelectedMapId(newMap.id);
    localStorage.setItem('selectedMapId', newMap.id);
    setMapData({ title, nodes: [], edges: [] });
  };

  const handleSave = async (updatedMapData) => {
    if (!selectedMapId) return;
    await saveMapToDrive(selectedMapId, updatedMapData);
  };

  return (
    <AppLayout>
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <select className="border p-2" value={selectedMapId} onChange={handleMapChange}>
          <option value="">Select a concept map</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
        <button onClick={handleCreateMap} className="bg-green-500 text-white px-4 py-2 rounded">
          + Create New Map
        </button>
      </div>

      {selectedMapId && mapData && (
        <ConceptMap
          mapData={mapData}
          setMapData={setMapData}
          selectedMapId={selectedMapId}
          onSave={handleSave}
        />
      )}
    </div>
    </AppLayout>
  );
};

export default ConceptMapPage;
