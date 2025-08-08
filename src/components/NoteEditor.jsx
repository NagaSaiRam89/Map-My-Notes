import React, { useState, useEffect, useRef } from 'react';
import { extractKeywords } from '../utils/keywordUtils';
import { loadMapFromDrive, saveMapToDrive } from '../utils/conceptMapUtils';
import OCRUpload from './OCRUpload';

export default function NoteEditor({ note, onChange, onSave }) {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const textareaRef = useRef(null);

  const keywords = extractKeywords(note?.content);

  // ✅ Select a keyword from highlight + press K
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault(); // Prevent "k" from being typed
  
        const textarea = textareaRef.current;
        const currentKeywords = new Set(note.userKeywords || []);
  
        // ✅ If selecting text in the textarea
        if (textarea && document.activeElement === textarea) {
          const selectedText = textarea.value
            .substring(textarea.selectionStart, textarea.selectionEnd)
            .trim();
  
          if (selectedText && !currentKeywords.has(selectedText)) {
            currentKeywords.add(selectedText);
  
            const updated = {
              ...note,
              userKeywords: Array.from(currentKeywords),
            };
            onChange(updated);
          }
        }
        // ✅ Or if `selectedKeyword` exists
        else if (selectedKeyword && !currentKeywords.has(selectedKeyword)) {
          currentKeywords.add(selectedKeyword);
  
          const updated = {
            ...note,
            userKeywords: Array.from(currentKeywords),
          };
          onChange(updated);
        }
      }
    };
  
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedKeyword, note, onChange]);
  
  const handlePromoteToMap = async () => {
    if (!note) return;
    const conceptMap = await loadMapFromDrive();
    const existingNodes = conceptMap.nodes.map((n) => n.label);

    const newNodes = (note.userKeywords || [])
      .filter((k) => !existingNodes.includes(k))
      .map((k) => ({
        id: `n-${Date.now()}-${k}`,
        label: k,
        x: Math.random() * 500,
        y: Math.random() * 500,
      }));

    const updatedMap = {
      ...conceptMap,
      nodes: [...conceptMap.nodes, ...newNodes],
    };

    await saveMapToDrive(updatedMap);
    alert('✔️ Keywords synced to concept map');
  };

  const handleOCRExtracted = (text) => {
    const updated = {
      ...note,
      content: (note.content || '') + '\n' + text,
    };
    onChange(updated);
  };

  if (!note) {
    return <div className="p-4 text-gray-500">No note selected.</div>;
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* OCR upload */}
      <OCRUpload onTextExtracted={handleOCRExtracted} />

      {/* Title */}
      <input
        type="text"
        placeholder="Note Title"
        className="w-full p-2 border rounded font-semibold"
        value={note.title || ''}
        onChange={(e) => onChange({ ...note, title: e.target.value })}
      />

      {/* Content */}
      <textarea
        ref={textareaRef}
        className="w-full flex-1 p-4 border rounded resize-none"
        value={note.content || ''}
        onChange={(e) => onChange({ ...note, content: e.target.value })}
        placeholder="Start typing your note..."
      />

      {/* Keywords */}
      <div className="mt-1 text-sm text-gray-600">
        <strong>Extracted Keywords (click + press K):</strong>
        <div className="flex flex-wrap gap-2 mt-1">
          {keywords.map((k, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                selectedKeyword === k
                  ? 'bg-blue-600 text-white'
                  : 'bg-yellow-100 text-black'
              }`}
              onClick={() => setSelectedKeyword(k)}
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* Added Tags */}
      {note.userKeywords?.length > 0 && (
        <div className="mt-1 text-sm text-green-600">
          <strong>Added Tags:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {note.userKeywords.map((k, idx) => (
              <span key={idx} className="bg-green-100 px-2 py-0.5 rounded">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* save button */}

      <button
        onClick={() => onSave(note)}
        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 self-start mt-2"
      >
        💾 Save Note
      </button>


      {/* Sync Button */}
      <button
        onClick={handlePromoteToMap}
        className="bg-purple-600 text-white text-sm px-3 py-1 rounded hover:bg-purple-700 self-start"
      >
        Sync Tags to Concept Map
      </button>
    </div>
  );
}
