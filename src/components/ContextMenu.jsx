import React from 'react';

export default function ContextMenu({ top, left, onEdit, onDelete, onAddNode, onClose, deleteLabel }) {
  const menuStyle = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 1000,
  };

  return (
    <div style={menuStyle} className="bg-white rounded-md shadow-lg border text-sm" onClick={onClose}>
      <ul className="py-1">
        {onAddNode && (
          <li
            onClick={onAddNode}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            ➕ Add New Node
          </li>
        )}
        {onEdit && (
          <li
            onClick={onEdit}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            ✏️ Edit Label
          </li>
        )}
        {onDelete && (
          <li
            onClick={onDelete}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
          >
            🗑️ {deleteLabel || 'Delete'}
          </li>
        )}
      </ul>
    </div>
  );
}