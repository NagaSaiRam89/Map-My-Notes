// ConceptMapPage.jsx
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import ConceptMap from '../components/ConceptMap';
import {
  getAllMaps,
  createNewMap,
  loadMapFromDrive,
  saveMapToDrive,
} from '../utils/GoogleDriveService';

export default function ConceptMapPage() {
  const [maps, setMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [currentMapData, setCurrentMapData] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  useEffect(() => {
    const load = async () => {
      const userMaps = await getAllMaps();
      setMaps(userMaps);
      const lastSelected = localStorage.getItem('selectedMapId');
      const fallbackId = userMaps[0]?.id || null;
      setSelectedMapId(lastSelected || fallbackId);
    };
    load();
  }, []);

  useEffect(() => {
    const loadSelectedMapData = async () => {
      if (selectedMapId) {
        localStorage.setItem('selectedMapId', selectedMapId);
        const mapData = await loadMapFromDrive(selectedMapId);
        setCurrentMapData({ ...mapData, id: selectedMapId });
      }
    };
    loadSelectedMapData();
  }, [selectedMapId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mapData?.id) {
        const updatedMap = {
          ...mapData,
          nodes,
          edges,
        };
        setMapData(updatedMap);
        saveMapToDrive(mapData.id, updatedMap); // ✅ both passed
      }
    }, 500);
  
    return () => clearTimeout(timeout);
  }, [nodes, edges]);
  

  const handleCreateNewMap = async () => {
    const title = prompt("Enter a name for the new concept map");
    if (!title) return;
  
    try {
      const newMap = await createNewMap(title);
      setMapData(newMap);
      setNodes([]);
      setEdges([]);
      setSelectedMapId(newMap.id);
      setMaps(prev => [...prev, { id: newMap.id, name: newMap.name }]);
    } catch (error) {
      console.error("Error creating new map:", error);
      alert("Failed to create new map.");
    }
  };
  
  
  const handleMapChange = (e) => {
    setSelectedMapId(e.target.value);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', padding: '1rem' }}>🧠 Concept Map</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', paddingBottom: '1rem' }}>
        <select value={selectedMapId || ''} onChange={handleMapChange}>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>{map.title}</option>
          ))}
        </select>
        <button onClick={handleCreateNewMap}>+ New Map</button>
      </div>

      <ReactFlowProvider>
        {currentMapData && (
          <ConceptMap
            mapData={currentMapData}
            setMapData={setCurrentMapData}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
}
