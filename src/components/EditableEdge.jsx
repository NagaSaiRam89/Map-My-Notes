import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

const EditableEdge = ({ id, sourceX, sourceY, targetX, targetY, data }) => {
  const [edgePath] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <foreignObject
          width={100}
          height={40}
          x={(sourceX + targetX) / 2 - 50}
          y={(sourceY + targetY) / 2 - 20}
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div>
            <input
              type="text"
              value={data?.label || ''}
              onChange={(e) => data?.onChange?.(id, e.target.value)}
              style={{
                width: '100%',
                fontSize: '12px',
                border: '1px solid #ccc',
                padding: '2px',
                background: '#fff',
              }}
            />
          </div>
        </foreignObject>
      </EdgeLabelRenderer>
    </>
  );
};

export default EditableEdge;
