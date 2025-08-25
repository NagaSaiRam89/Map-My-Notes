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
import { saveNotesToDrive } from '../utils/GoogleDriveService';
import ContextMenu from './ContextMenu';
import CustomNode from './CustomNode'; 

export default function ConceptMap({ initialMapData, notes, setNotes, onSave, selectedMapId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialMapData.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialMapData.edges || []);
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [menu, setMenu] = useState(null);
  const navigate = useNavigate();
  const [savingStatus, setSavingStatus] = useState('Saved'); 
  const { screenToFlowPosition } = useReactFlow(); 
  const nodeTypes = useMemo(() => ({
    default: CustomNode, // Set your custom node as the default
  }), []);
  
  // Auto-save map when nodes or edges change
  useEffect(() => {
    setSavingStatus('Saving...');
    const handler = setTimeout(() => {
      onSave({ ...initialMapData, nodes, edges })
        .then(() => setSavingStatus('Saved'))
        .catch(() => setSavingStatus('Error'));
    }, 1500);
    return () => clearTimeout(handler);
  }, [nodes, edges, onSave, initialMapData]);

  // Compute available keywords from selected notes
  const availableKeywords = useMemo(() => {
    const keywords = new Set();
    notes
      .filter(note => selectedNoteIds.includes(note.id))
      .forEach(note => (note.userKeywords || []).forEach(k => keywords.add(k)));
    return Array.from(keywords);
  }, [selectedNoteIds, notes]);

  // Add selected keywords from notes as new nodes
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
    toast.success(`${newNodes.length} new keyword(s) added!`);
    setSelectedKeywords([]);
  };

  // Create a new node and a corresponding new note
  const handleAddNode = useCallback(async (position) => {
    const label = prompt("Enter a label for the new node:");
    if (!label || !label.trim()) return;

    // Create the new node for the canvas
    const newNode = {
      id: `node-${Date.now()}`,
      data: { label },
      position, // This position is already converted by the context menu
      type: 'default',
    };
    setNodes((nds) => [...nds, newNode]);

    // Create the corresponding new note
    const newNote = {
      id: Date.now().toString(),
      title: label,
      content: `This note corresponds to the '${label}' concept.`,
      userKeywords: [label],
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...(notes || [])];
    setNotes(updatedNotes); 
    await saveNotesToDrive(updatedNotes); 
    toast.success(`Node and note for '${label}' created!`);
  }, [setNodes, notes, setNotes]);
  // Navigate to the note editor when a node is clicked
  const handleNodeClick = useCallback(
    (event, node) => {
      const keyword = node.data.label;
      const found = notes.find(n => n.userKeywords?.includes(keyword) || n.title.includes(keyword));

      if (found) {
        navigate(`/note/${found.id}?mapId=${selectedMapId}`);
      } else {
        toast.error(`No note found for keyword: "${keyword}"`);
      }
    },
    [notes, navigate, selectedMapId]
  );
  
  // Set the selected edge for label editing
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setMenu(null); // Close context menu if open
    setSelectedEdge(edge);
  }, []);
  
  // Update the label of the selected edge
  const handleEdgeLabelChange = (e) => {
    if (!selectedEdge) return;
    const newLabel = e.target.value;
    const updatedEdges = edges.map((edge) => {
      if (edge.id === selectedEdge.id) {
        return { ...edge, label: newLabel, data: { ...edge.data, label: newLabel } };
      }
      return edge;
    });
    setEdges(updatedEdges);
    setSelectedEdge(prev => ({...prev, label: newLabel, data: {...prev.data, label: newLabel}}));
  };

  // Add a new edge with a default label
  const onConnect = useCallback((params) => {
    const newEdge = { ...params, data: { label: 'related to' }, label: 'related to' };
    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  // --- Context Menu Handlers ---
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setMenu({ type: 'node', id: node.id, top: event.clientY, left: event.clientX, data: node.data });
  }, [setMenu]);
  
  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setMenu({ type: 'edge', id: edge.id, top: event.clientY, left: event.clientX });
  }, [setMenu]);

  const onPaneContextMenu = useCallback((event) => {
    event.preventDefault();
    const position = { x: event.clientX, y: event.clientY }; // Position to create new node
    setMenu({ type: 'pane', top: event.clientY, left: event.clientX, data: { position: { x: event.clientX, y: event.clientY } } });
  }, []);
  const onPaneClick = useCallback(() => setMenu(null), []);

  return (
    <div className="flex h-[75vh]">
      {/* Sidebar */}
      <div className="w-80 p-4 border-r space-y-4 overflow-y-auto">
        <div>
          <h3 className="font-semibold mb-2">Map Controls</h3>
           {/* Save Status Indicator */}
           <div className="text-xs text-gray-500 mb-2">
            Status: 
            {savingStatus === 'Saving...' && <span className="text-yellow-500"> Saving...</span>}
            {savingStatus === 'Saved' && <span className="text-green-500"> All changes saved</span>}
            {savingStatus === 'Error' && <span className="text-red-500"> Save Error</span>}
          </div>
          <p className="text-xs text-gray-500 mb-2">Right-click on the map canvas or on elements for more options.</p>
        </div>
        <div>
          <h3 className="font-semibold">Extract from Notes</h3>
          <select
            multiple
            value={selectedNoteIds}
            onChange={(e) => setSelectedNoteIds(Array.from(e.target.selectedOptions, o => o.value))}
            className="w-full border p-2 h-40 mt-1"
          >
            {notes.map(note => (
              <option key={note.id} value={note.id}>{note.title || 'Untitled'}</option>
            ))}
          </select>

          {availableKeywords.length > 0 && (
            <div className="space-y-2 mt-2">
              <h4 className="font-semibold text-sm">Select Keywords</h4>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                {availableKeywords.map(kw => (
                  <label key={kw} className="flex items-center gap-1 cursor-pointer text-sm">
                    <input type="checkbox" value={kw} checked={selectedKeywords.includes(kw)}
                      onChange={() => setSelectedKeywords(prev => 
                        prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw]
                      )}
                    />
                    {kw}
                  </label>
                ))}
              </div>
              <button onClick={addKeywordsAsNodes} className="w-full bg-blue-500 text-white px-3 py-1 rounded" disabled={selectedKeywords.length === 0}>
                Add to Map
              </button>
            </div>
          )}
        </div>
        
        {selectedEdge && (
          <div className="mt-4 p-2 border rounded bg-gray-50">
            <h3 className="font-semibold text-sm mb-2">Edit Edge Label</h3>
            <input
              type="text"
              value={selectedEdge.data?.label || ''}
              onChange={handleEdgeLabelChange}
              className="w-full p-1 border rounded text-sm"
              placeholder="e.g., 'is related to'"
            />
          </div>
        )}
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        {menu && (
          <ContextMenu
            top={menu.top}
            left={menu.left}
            onClose={() => setMenu(null)}
            onAddNode={menu.type === 'pane' ? () => handleAddNode(menu.data.position) : null}
            onEdit={menu.type === 'node' ? () => {
              const newLabel = prompt('Enter new label:', menu.data.label);
              if (newLabel) {
                setNodes((nds) =>
                  nds.map((n) => (n.id === menu.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
                );
              }
            } : null}
            onDelete={
              menu.type === 'node' ? () => {
                setNodes((nds) => nds.filter((node) => node.id !== menu.id));
                setEdges((eds) => eds.filter((edge) => edge.source !== menu.id && edge.target !== menu.id));
              } :
              menu.type === 'edge' ? () => {
                setEdges((eds) => eds.filter((edge) => edge.id !== menu.id));
              } : null
            }
            deleteLabel={menu.type === 'node' ? 'Delete Node' : 'Delete Connection'}
          />
        )}
      </div>
    </div>
  );
}
