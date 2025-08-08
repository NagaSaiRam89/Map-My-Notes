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

export default function ConceptMapPage({ notes, setNotes }) {
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(localStorage.getItem('selectedMapId') || '');
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMapList() {
      const allMaps = await getAllMaps();
      setMaps(allMaps);
    }
    loadMapList();
  }, []);

  useEffect(() => {
    async function loadSelectedMap() {
      if (!selectedMapId) {
        setMapData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const cachedMap = localStorage.getItem(`map_cache_${selectedMapId}`);
      if (cachedMap) {
        setMapData(JSON.parse(cachedMap));
      }
      try {
        const dataFromDrive = await loadMapFromDrive(selectedMapId);
        setMapData(dataFromDrive);
        localStorage.setItem(`map_cache_${selectedMapId}`, JSON.stringify(dataFromDrive));
      } catch (err) {
        console.error('Failed to load selected map:', err);
      } finally {
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
    setMaps(prev => [...prev, newMap]);
    setSelectedMapId(newMap.id);
  };

  const handleSave = useCallback(async (updatedMapData) => {
    if (!selectedMapId) return;
    await saveMapToDrive(selectedMapId, updatedMapData);
    localStorage.setItem(`map_cache_${selectedMapId}`, JSON.stringify(updatedMapData));
  }, [selectedMapId]);

  return (
    <AppLayout>
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 space-y-4">
        <div className="flex items-center gap-4 border-b pb-4">
          <label htmlFor="map-select" className="font-semibold text-gray-700">Current Map:</label>
          <select id="map-select" className="flex-grow border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-primary focus:border-primary" value={selectedMapId} onChange={handleMapChange}>
            <option value="">Select a map</option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>{map.name}</option>
            ))}
          </select>
          <button onClick={handleCreateMap} className="bg-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-purple-700 transition whitespace-nowrap">
            + New Map
          </button>
        </div>

        {loading && <div className="text-center p-10">Loading Map...</div>}

        {!loading && selectedMapId && mapData && (
          <ReactFlowProvider>
            <ConceptMap
              key={selectedMapId}
              initialMapData={mapData}
              notes={notes}
              setNotes={setNotes}
              onSave={handleSave}
              selectedMapId={selectedMapId}
            />
          </ReactFlowProvider>
        )}
        {!loading && !selectedMapId && (
            <div className="text-center p-10 text-gray-500">
                <p>Please select a map from the dropdown, or create a new one to begin.</p>
            </div>
        )}
      </div>
    </AppLayout>
  );
}