import React from 'react';
export default function KeywordSelector({ keywords, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((k, i) => (
        <span
          key={i}
          onClick={() => onToggle(k)}
          className={`px-2 py-1 rounded cursor-pointer border transition ${
            selected.includes(k)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {k}
        </span>
      ))}
    </div>
  );
}
