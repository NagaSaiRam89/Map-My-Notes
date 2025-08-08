import React, { useState } from 'react';

const intervals = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '1 Week', days: 7 },
];

export default function IntervalPicker({ onSelect }) {
  const [customDays, setCustomDays] = useState('');

  const handleCustom = () => {
    const days = parseInt(customDays, 10);
    if (!isNaN(days) && days >= 0) {
      onSelect(days);
      setCustomDays('');
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center text-sm">
      {intervals.map((i) => (
        <button
          key={i.label}
          onClick={() => onSelect(i.days)}
          className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          {i.label}
        </button>
      ))}

      <input
        type="number"
        min="0"
        placeholder="Custom (days)"
        value={customDays}
        onChange={(e) => setCustomDays(e.target.value)}
        className="border px-2 py-1 w-24 rounded"
      />
      <button
        onClick={handleCustom}
        className="px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
      >
        Set
      </button>
    </div>
  );
}
