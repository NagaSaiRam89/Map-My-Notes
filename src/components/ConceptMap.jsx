import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ConceptMap({ initialMapData, notes, onSave, selectedMapId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialMapData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialMapData.edges || []);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const navigate = useNavigate();

  // Auto-save map when nodes or edges change (with debounce)
  useEffect(() => {
    const handler = setTimeout(() => {
      onSave({ ...initialMapData, nodes, edges });
    }, 1000); // Save 1 second after last change
    return () => clearTimeout(handler);
  }, [nodes, edges, onSave, initialMapData]);

  const availableKeywords = useMemo(() => {
    const keywords = new Set();
    notes
      .filter(note => selectedNoteIds.includes(note.id))
      .forEach(note => (note.userKeywords || []).forEach(k => keywords.add(k)));
    return Array.from(keywords);
  }, [selectedNoteIds, notes]);

  const addKeywordsAsNodes = () => {
    const existingNodeLabels = new Set(nodes.map(n => n.data.label));
    const newNodes = selectedKeywords
      .filter(kw => !existingNodeLabels.has(kw))
      .map((kw, idx) => ({
        id: `${kw}-${Date.now()}-${idx}`,
        type: 'default',
        position: { x: Math.random() * 400, y: Math.random() * 400 + 50 },
        data: { label: kw },
      }));
    
    setNodes(nds => [...nds, ...newNodes]);
    toast.success(`${newNodes.length} new keyword(s) added as nodes!`);
    setSelectedKeywords([]);
  };

  const handleNodeClick = useCallback(
    (event, node) => {
      const keyword = node.data.label;
      const found = notes.find(n => n.userKeywords?.includes(keyword) || n.title.includes(keyword));

      if (found) {
        navigate(`/note/${found.id}?mapId=${selectedMapId}`);
      } else {
        // Here you could create a new note if you want
        toast.error(`No note found for keyword: "${keyword}"`);
      }
    },
    [notes, navigate, selectedMapId]
  );

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="flex h-[75vh]">
      {/* Sidebar for keyword extraction */}
      <div className="w-72 p-4 border-r space-y-4">
        <h3 className="font-semibold">Extract from Notes</h3>
        <select
          multiple
          value={selectedNoteIds}
          onChange={(e) => setSelectedNoteIds(Array.from(e.target.selectedOptions, o => o.value))}
          className="w-full border p-2 h-40"
        >
          {notes.map(note => (
            <option key={note.id} value={note.id}>{note.title || 'Untitled'}</option>
          ))}
        </select>

        {availableKeywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Select Keywords</h4>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border p-2 rounded">
              {availableKeywords.map(kw => (
                <label key={kw} className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    value={kw}
                    checked={selectedKeywords.includes(kw)}
                    onChange={() => setSelectedKeywords(prev => 
                      prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
                    )}
                  />
                  {kw}
                </label>
              ))}
            </div>
            <button
              onClick={addKeywordsAsNodes}
              className="w-full bg-blue-500 text-white px-3 py-1 rounded"
              disabled={selectedKeywords.length === 0}
            >
              Add to Map
            </button>
          </div>
        )}
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}