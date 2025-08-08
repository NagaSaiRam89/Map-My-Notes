import React from 'react';

const NodeEditorSidebar = ({ selectedNode, onUpdateNodeLabel, onDeleteNode }) => {
  if (!selectedNode || !selectedNode.data) {
    return (
      <div className="p-4 border-l w-64 bg-white text-gray-600">
        <p>No node selected.</p>
      </div>
    );
  }

  const { id, data } = selectedNode;

  return (
    <div className="p-4 border-l w-64 bg-white text-gray-800">
      <h3 className="text-lg font-semibold mb-2">📝 Node Editor</h3>

      <label className="block text-sm font-medium mb-1">Label</label>
      <input
        type="text"
        value={data.label || ''}
        onChange={(e) => onUpdateNodeLabel(id, e.target.value)}
        className="w-full border border-gray-300 p-2 rounded mb-3"
      />

      <button
        onClick={() => onDeleteNode(id)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        🗑 Delete Node
      </button>
    </div>
  );
};

export default NodeEditorSidebar;
