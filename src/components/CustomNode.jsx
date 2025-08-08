import React from 'react';

const CustomNode = ({ id, data }) => {
  return (
    <div style={{ background: 'white', border: '1px solid #ccc', padding: '6px', borderRadius: '4px' }}>
      <div>{data.label}</div>
      <button
        onClick={() => data.onDelete(id)}
        style={{ fontSize: '10px', color: 'red', marginTop: '4px' }}
      >
        ✖ Delete
      </button>
    </div>
  );
};

export default CustomNode;
