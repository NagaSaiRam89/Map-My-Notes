import React, { useEffect, useState } from 'react';

const KeywordExtractor = ({ allNotes = [], onAddNodes }) => {
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // 🧠 Extract keywords from selected notes
  useEffect(() => {
    const keywordSet = new Set();

    const selectedNotes = allNotes.filter(note => selectedNoteIds.includes(String(note.id)));
    console.log('📝 Selected Notes:', selectedNotes);

    selectedNotes.forEach(note => {
      if (Array.isArray(note.keywords)) {
        note.keywords.forEach(k =>
          keywordSet.add(JSON.stringify({ keyword: k, noteId: note.id }))
        );
      }
    });

    const keywordObjects = Array.from(keywordSet).map(str => JSON.parse(str));
    setAvailableKeywords(keywordObjects);
    setSelectedKeywords([]); // reset on note change
  }, [selectedNoteIds, allNotes]);

  const handleNoteSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelectedNoteIds(selectedOptions);
  };

  const handleKeywordToggle = (keywordObj) => {
    setSelectedKeywords(prev =>
      prev.some(k => k.keyword === keywordObj.keyword && k.noteId === keywordObj.noteId)
        ? prev.filter(k => !(k.keyword === keywordObj.keyword && k.noteId === keywordObj.noteId))
        : [...prev, keywordObj]
    );
  };

  const handleCreateNodes = () => {
    const newNodes = selectedKeywords.map((k, i) => ({
      id: `node-${k.keyword}-${Date.now()}-${i}`,
      type: 'default',
      position: {
        x: Math.random() * 600,
        y: 100 + i * 60,
      },
      data: {
        label: k.keyword,
        noteId: k.noteId,
      },
    }));

    onAddNodes(newNodes);
    setSelectedKeywords([]);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">🧠 Extract Keywords as Nodes</h3>

      {/* Select Notes */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-600 mb-1">Select Notes:</label>
        <select
          multiple
          className="w-full border border-gray-300 p-2 rounded"
          value={selectedNoteIds}
          onChange={handleNoteSelectChange}
        >
          {allNotes.map(note => (
            <option key={note.id} value={String(note.id)}>
              {note.title || 'Untitled'}
            </option>
          ))}
        </select>
      </div>

      {/* Select Keywords */}
      {availableKeywords.length > 0 ? (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">Select Keywords:</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border p-2 rounded">
            {availableKeywords.map(k => {
              const isChecked = selectedKeywords.some(
                sel => sel.keyword === k.keyword && sel.noteId === k.noteId
              );
              return (
                <label key={`${k.keyword}-${k.noteId}`} className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleKeywordToggle(k)}
                  />
                  <span>{k.keyword}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        selectedNoteIds.length > 0 && (
          <p className="text-sm text-gray-500">No keywords found in selected notes.</p>
        )
      )}

      {/* Create Nodes Button */}
      <button
        disabled={selectedKeywords.length === 0}
        onClick={handleCreateNodes}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        ➕ Add Selected Keywords as Nodes
      </button>
    </div>
  );
};

export default KeywordExtractor;
