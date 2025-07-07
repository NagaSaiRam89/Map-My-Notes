// src/components/MapCanvas.js
import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import NoteEditor from './NoteEditor';

const MapCanvas = forwardRef((props, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      position: { x: 250, y: 5 },
      data: { label: 'Start Note', content: '' },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (text = '') => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: text.slice(0, 20) || `Note ${nodes.length + 1}`, content: text },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleNodeClick = (e, node) => {
    setSelectedNode(node);
    setIsEditorOpen(true);
  };

  const updateNodeContent = (newContent) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? { ...n, data: { ...n.data, label: newContent.slice(0, 20), content: newContent } }
          : n
      )
    );
    setIsEditorOpen(false);
  };

  // 👇 Expose addNode to parent using ref
  useImperativeHandle(ref, () => ({
    addOCRNode: addNode,
    getMapData: () => ({ nodes, edges }),
    setMapData: ({ nodes: newNodes, edges: newEdges }) => {
      setNodes(newNodes || []);
      setEdges(newEdges || []);
    },
  }));
  
  

  return (
    <div className="w-full h-[80vh] bg-gray-100 border rounded">
      <div className="flex justify-end p-2">
        <button
          onClick={() => addNode()}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Node
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {isEditorOpen && (
        <NoteEditor
          content={selectedNode?.data?.content || ''}
          onSave={updateNodeContent}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
});

export default MapCanvas;
