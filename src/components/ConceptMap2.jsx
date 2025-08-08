// src/components/ConceptMap.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { loadNotesFromDrive, saveNotesToDrive } from '../utils/notesUtils';
import { getNoteById } from '../utils/GoogleDriveService';
import { useNavigate } from 'react-router-dom';
import EditableEdge from './EditableEdge';
import CustomNode from './CustomNode';

// Extracted earlier...
// function extractKeywords(text) { ... }

export default function ConceptMap({ mapData, setMapData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(mapData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mapData.edges);
  const [notes, setNotes] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setMapData(prev => ({
      ...prev,
      nodes,
      edges
    }));
  }, [nodes, edges]);
  
  useEffect(() => { loadNotesFromDrive().then(setNotes); }, []);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ editable: EditableEdge }), []);

  const onConnect = useCallback(
    params => {
      const newEdges = addEdge({ ...params, type: 'editable', data: { onChange: handleEdgeLabelChange } }, edges);
      setEdges(newEdges);
    },
    [edges]
  );

  useEffect(() => {
    if (selectedMap && selectedMap.id) {
      const timeout = setTimeout(() => {
        saveMapToDrive(selectedMap.id, {
          title: selectedMap.title,
          nodes,
          edges,
        });
      }, 1000); // Debounce for 1 second
  
      return () => clearTimeout(timeout);
    }
  }, [nodes, edges]);
  
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes]);
  


  function handleEdgeLabelChange(id, label) {
    setEdges(es => es.map(e => e.id === id ? { ...e, data: { ...e.data, label } } : e));
  }

  const handleDeleteNode = id => {
    setNodes(ns => ns.filter(n => n.id !== id));
    setEdges(es => es.filter(e => e.source !== id && e.target !== id));
  };

  const addKeywords = () => {
    let i = 0;
    const newNodes = selectedKeywords.map(kw => ({
      id: `${kw}-${Date.now()}-${i++}`,
      type: 'custom',
      data: { label: kw, onDelete: handleDeleteNode },
      position: { x: Math.random() * 400, y: Math.random() * 400 }
    }));
    setNodes(ns => [...ns, ...newNodes]);
  };

  const handleNoteSelect = async id => {
    setSelectedNoteId(id);
    const note = notes.find(n => n.id === id) || await getNoteById(id);
    setSelectedNote(note);
    setKeywords(note.userKeywords || []);
    setSelectedKeywords([]);
  };

  const handleNodeClick = (e, node) => {
    const kw = node.data.label;
    const note = notes.find(n => (n.userKeywords || []).includes(kw));
    if (note) {
      navigate(`/note/${note.id}?mapId=${mapData.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '90vh' }}>
      <div style={{ width: 200, padding: 10 }}>
        <h3>Select Note</h3>
        <select onChange={e => handleNoteSelect(e.target.value)}>
          <option value="">--</option>
          {notes.map(n => <option key={n.id} value={n.id}>{n.title}</option>)}
        </select>
        {keywords.length > 0 && (
          <>
            <h4>Keywords</h4>
            <div>
              {keywords.map(kw => (
                <label key={kw}>
                  <input type="checkbox" value={kw}
                    checked={selectedKeywords.includes(kw)}
                    onChange={e => {
                      const v = e.target.value;
                      setSelectedKeywords(sel =>
                        sel.includes(v) ? sel.filter(x => x !== v) : sel.concat(v)
                      );
                    }}
                  />
                  {kw}
                </label>
              ))}
            </div>
            <button onClick={addKeywords}>Add Nodes</button>
          </>
        )}
      </div>

      <div style={{ flexGrow: 1,  width: '100%', height: '80vh' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          fitView
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
