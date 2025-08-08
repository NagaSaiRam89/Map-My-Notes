// src/components/ConceptMap.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { loadNotesFromDrive, getNoteById } from '../utils/notesUtils';
import { useNavigate } from 'react-router-dom';

import EditableEdge from './EditableEdge';
import CustomNode from './CustomNode';

const ConceptMap = ({ mapData, setMapData, selectedMapId, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(mapData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(mapData.edges || []);

  const [notes, setNotes] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const navigate = useNavigate();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ editable: EditableEdge }), []);

  useEffect(() => {
    loadNotesFromDrive().then(setNotes);
  }, []);

  useEffect(() => {
    setMapData((prev) => ({
      ...prev,
      nodes,
      edges,
    }));
  }, [nodes, edges, setMapData]);

  const handleEdgeLabelChange = (id, label) => {
    setEdges((edges) =>
      edges.map((e) => (e.id === id ? { ...e, data: { ...e.data, label } } : e))
    );
  };

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'editable',
        data: { onChange: handleEdgeLabelChange },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleDeleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  };

  const handleNoteSelect = async (noteId) => {
    setSelectedNoteId(noteId);
    const note = notes.find((n) => n.id === noteId) || (await getNoteById(noteId));
    setKeywords(note?.userKeywords || []);
    setSelectedKeywords([]);
  };

  const addKeywords = () => {
    let i = 0;
    const newNodes = selectedKeywords.map((kw) => ({
      id: `${kw}-${Date.now()}-${i++}`,
      type: 'custom',
      data: { label: kw, onDelete: handleDeleteNode },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    }));
    setNodes((nds) => [...nds, ...newNodes]);
  };

  const handleNodeClick = (e, node) => {
    const keyword = node.data.label;
    const note = notes.find((n) => (n.userKeywords || []).includes(keyword));
    if (note) {
      navigate(`/note/${note.id}?mapId=${selectedMapId}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ width: 220, padding: 10, overflowY: 'auto', borderRight: '1px solid #ccc' }}>
        <h3>Select Note</h3>
        <select onChange={(e) => handleNoteSelect(e.target.value)} value={selectedNoteId || ''}>
          <option value="">-- Select Note --</option>
          {notes.map((n) => (
            <option key={n.id} value={n.id}>
              {n.title}
            </option>
          ))}
        </select>

        {keywords.length > 0 && (
          <>
            <h4>Keywords</h4>
            <div style={{ maxHeight: 150, overflowY: 'auto' }}>
              {keywords.map((kw) => (
                <label key={kw} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    value={kw}
                    checked={selectedKeywords.includes(kw)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedKeywords((prev) =>
                        prev.includes(v) ? prev.filter((k) => k !== v) : [...prev, v]
                      );
                    }}
                  />
                  {kw}
                </label>
              ))}
            </div>
            <button onClick={addKeywords} disabled={selectedKeywords.length === 0}>
              ➕ Add Keywords as Nodes
            </button>
          </>
        )}
      </div>

      <div style={{ flexGrow: 1 }}>
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
};

export default ConceptMap;
