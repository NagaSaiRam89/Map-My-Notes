import React, { useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

export default function ConceptCanvas({ data, onSave, onNodeClick }) {
  const [nodes, setNodes] = useState(
    data.nodes.map(n => ({ id: n.id, position: { x: n.x, y: n.y }, data: { label: n.label } }))
  );
  const [edges, setEdges] = useState(data.edges || []);

  const onNodeDragStop = (e, node) => {
    setNodes(nds =>
      nds.map(n => (n.id === node.id ? { ...n, position: node.position } : n))
    );
  };

  const onConnect = connection => setEdges(eds => [...eds, connection]);

  const applyChanges = () => {
    const updated = {
      ...data,
      nodes: nodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y, label: n.data.label })),
      edges: edges,
    };
    onSave(updated);
  };

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(e, n) => onNodeClick({ id: n.id, label: n.data.label })}
        onNodesChange={setNodes}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
      <button
        onClick={applyChanges}
        className="absolute bottom-6 right-6 bg-blue-600 text-white px-3 py-2 rounded shadow-lg"
      >
        Save Map
      </button>
    </div>
  );
}
