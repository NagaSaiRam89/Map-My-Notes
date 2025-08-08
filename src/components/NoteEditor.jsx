import React, { useState, useEffect, useRef } from 'react';
import { extractKeywords } from '../utils/keywordUtils';
import OCRUpload from './OCRUpload';
// Note: We no longer need to import concept map utilities here

export default function NoteEditor({ note, onChange }) {
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const textareaRef = useRef(null);

  // This is a computed value, it will update when note.content changes
  const keywords = extractKeywords(note?.content);

  // Effect for handling the "K" shortcut to add keywords
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key.toLowerCase() === 'k') {
        let keywordToAdd = null;
        const textarea = textareaRef.current;

        // Check for text selected inside the textarea
        if (textarea && document.activeElement === textarea && textarea.selectionStart !== textarea.selectionEnd) {
          keywordToAdd = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
        } 
        // Check for a selected keyword chip
        else if (selectedKeyword) {
          keywordToAdd = selectedKeyword;
        }

        if (keywordToAdd && !note.userKeywords?.includes(keywordToAdd)) {
          e.preventDefault(); // Prevent 'k' from being typed
          const updatedNote = {
            ...note,
            userKeywords: [...(note.userKeywords || []), keywordToAdd],
          };
          onChange(updatedNote); // Send the updated note to the parent
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedKeyword, note, onChange]);

  const handleOCRExtracted = (text) => {
    const updatedNote = {
      ...note,
      content: (note.content || '') + '\n' + text,
    };
    onChange(updatedNote);
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
        className="w-full p-2 border rounded font-semibold text-lg"
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

      {/* Keywords Display */}
      <div className="mt-1 text-sm text-gray-600">
        <strong>Extracted Keywords (click or select text + press K):</strong>
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

      {/* Added Tags Display */}
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
    </div>
  );
}