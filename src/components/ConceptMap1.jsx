import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BaseEdge,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getAllNotes, getNoteById , saveMapToDrive} from '../utils/GoogleDriveService';
import { useNavigate } from 'react-router-dom';
import { loadNotesFromDrive, saveNotesToDrive } from '../utils/notesUtils';
import EditableEdge from './EditableEdge';
import CustomNode from './CustomNode';



// Helper: extract keywords from note content
function extractKeywords(text) {
  if (!text) return [];
  const stopwords = ['the', 'is', 'in', 'and', 'of', 'a', 'to', 'are', 'used'];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word && !stopwords.includes(word));
  return [...new Set(words)];
}

// Custom Edge for React Flow
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#888', strokeWidth: 2 }} />
      <text>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle" fill="black">
          {data?.label || 'related to'}
        </textPath>
      </text>
    </>
  );
};

export default function ConceptMap({ mapData, setMapData }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { setViewport } = useReactFlow();
  const [loading, setLoading] = useState(false);
  const [noteList, setNoteList] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (mapData) {
      setNodes(mapData.nodes || []);
      setEdges(mapData.edges || []);
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [mapData, setNodes, setEdges, setViewport]);
 
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (mapData?.id) {
  //       const updatedMap = { ...mapData, nodes, edges };
  //       setMapData(updatedMap);
  //       saveMapToDrive(mapData.id, updatedMap);
  //     }
  //   }, 500); // debounce 500ms
  
  //   return () => clearTimeout(timeout);
  // }, [nodes, edges]);
  

  // Fetch note titles on load
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      const notes = await loadNotesFromDrive(); // ✅ Reads from the correct notes.json
      setNoteList(notes);
      setAvailableNotes(notes); // 👈 Add this to make keywords work immediately
      setLoading(false);
    };
    fetchNotes();
  }, []);
  

  // Fetch full note when a note is selected
  useEffect(() => {
    const fetchSelectedNote = async () => {
      if (!selectedNoteId) return;
  
      const alreadyLoaded = availableNotes.find((note) => note.id === selectedNoteId);
      if (alreadyLoaded) {
        setSelectedNote(alreadyLoaded);
        const extracted = alreadyLoaded.userKeywords || []; // ✅ changed
        setKeywords(extracted);
        return;
      }
  
      const fullNote = await getNoteById(selectedNoteId);
      if (fullNote) {
        setAvailableNotes((prev) => [...prev, fullNote]);
        setSelectedNote(fullNote);
        const extracted = fullNote.userKeywords || []; // ✅ changed
        setKeywords(extracted);
      }
    };
    fetchSelectedNote();
  }, [selectedNoteId]);

  const edgeTypes = useMemo(() => ({
    editable: EditableEdge,
  }), []); 

  const handleEdgeLabelChange = (id, label) => {
    const updated = edges.map((edge) =>
      edge.id === id ? { ...edge, data: { ...edge.data, label, onChange: handleEdgeLabelChange } } : edge
    );
    setEdges(updated);
  };
  
  
const nodeTypes = useMemo(() => ({
  custom: CustomNode,
}), []);

  const handleNoteSelect = (noteId) => {
    setSelectedNoteId(noteId); // just update the state
    setSelectedKeywords([]);
  };

  const handleDeleteNode = (id) => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id));
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id));
  };

  const newNode = {
    id: `n-${Date.now()}`,
    type: 'custom',
    data: { label: 'KeywordX', onDelete: handleDeleteNode },
    position: { x: 100, y: 100 },
  };
  
  
  
  const addKeywordsAsNodes = () => {
    const baseX = Math.random() * 400;
    const baseY = Math.random() * 400;

    const newNodes = selectedKeywords.map((keyword, index) => ({
      id: `${keyword}-${Date.now()}`,
      type: 'default',
      position: { x: baseX + index * 100, y: baseY + index * 60 },
      data: { label: keyword },
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  const handleNodeClick = (event, node) => {
    const keyword = node.data?.label || node.label;
    const existingNote = noteList.find((note) =>
      (note.userKeywords || []).includes(keyword)
    );
  
    const finalMapId = selectedMapId || localStorage.getItem('selectedMapId');
  
    if (existingNote) {
      navigate(`/note/${existingNote.id}?mapId=${finalMapId}`);
    } else {
      const newNote = {
        id: Date.now().toString(),
        title: keyword,
        content: '',
        userKeywords: [keyword],
        createdAt: new Date().toISOString(),
      };
      const updatedNotes = [...noteList, newNote];
      setNoteList(updatedNotes);
      saveNotesToDrive(updatedNotes);
      navigate(`/note/${newNote.id}?mapId=${finalMapId}`);
    }
  };
  
  
  

  const onConnect = useCallback(
    (params) => {
      const updatedEdges = addEdge(params, edges);
      setEdges(updatedEdges);
      setMapData((prev) => ({
        ...prev,
        edges: updatedEdges,
        nodes,
      }));
    },
    [edges, nodes, setMapData]
  );

  const onEdgesDelete = useCallback(
    (deleted) => {
      setEdges((prev) => prev.filter((e) => !deleted.some((d) => d.id === e.id)));
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        setEdges((prev) => prev.filter((e) => !e.selected));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);



  return (
    <div style={{ height: '90vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', padding: '1rem', borderRight: '1px solid #ccc' }}>
        <h3>Select Note</h3>
        <select value={selectedNoteId} onChange={(e) => handleNoteSelect(e.target.value)}>
          <option value="">-- Select a Note --</option>
          {noteList.map((note) => (
            <option key={note.id} value={note.id}>
              {note.title}
            </option>
          ))}
        </select>

        {keywords.length > 0 && (
          <>
            <h4>Select Keywords to Add</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {keywords.map((kw) => (
                <label key={kw} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    value={kw}
                    checked={selectedKeywords.includes(kw)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedKeywords((prev) =>
                        checked ? [...prev, kw] : prev.filter((k) => k !== kw)
                      );
                    }}
                  />
                  {kw}
                </label>
              ))}
            </div>
            <button
              onClick={addKeywordsAsNodes}
              style={{ marginTop: '1rem', padding: '0.5rem' }}
            >
              ➕ Add Selected as Nodes
            </button>
          </>
        )}
      </div>

      {/* Flow Canvas */}
      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={handleNodeClick}
          fitView
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          connectionLineStyle={{ stroke: '#2196f3' }}
          defaultEdgeOptions={{ type: 'custom', animated: true }}
          style={{ width: '100%', height: '90vh' }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
