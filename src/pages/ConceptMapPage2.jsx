// src/pages/ConceptMapPage.jsx
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ConceptMap from '../components/ConceptMap';
import {
  getAllMaps,
  createNewMap,
  loadMapFromDrive,
  saveMapToDrive,
  deleteMap,
} from '../utils/GoogleDriveService';


export default function ConceptMapPage() {
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(() => localStorage.getItem('selectedMapId'));
  const [mapData, setMapData] = useState({ id: '', name: '', nodes: [], edges: [] });
  const [fileId, setFileId] = useState(null);
  // Load all available maps
  useEffect(() => {
    getAllMaps().then(setMaps);
  }, []);

  // Load the selected map when selectedMapId changes
  useEffect(() => {
    if (selectedMapId) {
      localStorage.setItem('selectedMapId', selectedMapId);
      loadMapFromDrive(selectedMapId).then(data => {
        setMapData(data || { id: selectedMapId, name: 'Untitled Map', nodes: [], edges: [] });
      });
    }
  }, [selectedMapId]);

  const handleNewMap = async () => {
    const name = prompt('Enter map name');
    if (!name) return;
    const newMap = await createNewMap(name);
    setMaps(prev => [...prev, newMap]);
    setSelectedMapId(newMap.id);
  };

  const handleSave = async () => {
    if (selectedMap && selectedMap.id) {
      try {
        const mapData = {
          title: selectedMap.title,
          nodes,
          edges,
        };
        await saveMapToDrive(selectedMap.id, mapData);
        console.log('Map saved successfully!');
      } catch (err) {
        console.error('Error saving map:', err);
      }
    }
  };
  
  const handleMapSelect = async (mapId) => {
    // Save current map first
    await handleSave();
  
    // Load new map
    const loadedData = await loadMapFromDrive(mapId);
    if (loadedData) {
      setSelectedMap({ id: mapId, title: loadedData.title });
      setNodes(loadedData.nodes || []);
      setEdges(loadedData.edges || []);
    }
  };
  

  const handleDelete = async () => {
    if (!selectedMapId) return;
    const confirmDelete = window.confirm('Delete this map?');
    if (!confirmDelete) return;
    await deleteMap(selectedMapId);
    setMaps(prev => prev.filter(m => m.id !== selectedMapId));
    setSelectedMapId(null);
    setMapData({ id: '', name: '', nodes: [], edges: [] });
  };

  return (
    <div>
      <h2>🧠 Concept Map</h2>
      <div>
      <select value={selectedMapId || ''} onChange={e => {
            const selectedId = e.target.value;
            const selectedMap = maps.find(m => m.id === selectedId);
            if (selectedMap) {
                setFileId(selectedId);
                setMapData(selectedMap.data); // or `JSON.parse(selectedMap.data)` if it's stored as JSON string
            }
            }}>
        <option value="">-- Select Map --</option>
        {maps.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <button onClick={handleNewMap}>New Map</button>
      <button onClick={handleSave} disabled={!selectedMapId}>Save</button>
      <button onClick={handleDelete} disabled={!selectedMapId}>Delete</button>
      </div>
      <ReactFlowProvider>
        {selectedMapId && (
          <ConceptMap mapData={mapData} setMapData={setMapData} />
        )}
      </ReactFlowProvider>
    </div>
  );
}
