import React, { useState, useEffect } from 'react';
import KeywordSelector from './KeywordSelector';
import { extractKeywords } from '../utils/keywordUtils';

export default function NoteSelector({ notes, onPull }) {
  const [selNotes, setSelNotes] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selKeys, setSelKeys] = useState([]);

  useEffect(() => {
    const all = new Set();
    selNotes.forEach(id => {
      const note = notes.find(n => n.id === id);
      (note?.userKeywords || []).forEach(k => all.add(k));
    });
    setKeywords(Array.from(all));
  }, [selNotes, notes]);

  return (
    <div>
      <h2 className="font-bold mb-2">Extract from Notes</h2>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {notes.map(n => (
          <div key={n.id}>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selNotes.includes(n.id)}
                onChange={() =>
                  setSelNotes(prev =>
                    prev.includes(n.id) ? prev.filter(id => id !== n.id) : [...prev, n.id]
                  )
                }
              />
              {n.title || 'Untitled'}
            </label>
          </div>
        ))}
      </div>
      {keywords.length > 0 && (
        <>
          <h3 className="mt-4 font-semibold">Pick keywords</h3>
          <KeywordSelector
            keywords={keywords}
            selected={selKeys}
            onToggle={k => {
              setSelKeys(prev =>
                prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]
              );
            }}
          />
          <button
            className="mt-3 bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
            disabled={!selKeys.length}
            onClick={() => {
              const newNodes = selKeys.map(k => ({
                id: `n-${Date.now()}-${k}`,
                label: k,
                x: Math.random() * 800,
                y: Math.random() * 600,
              }));
              onPull(newNodes);
              setSelKeys([]);
            }}
          >
            Add to Map
          </button>
        </>
      )}
    </div>
  );
}
