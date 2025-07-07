// src/components/OCRUpload.js
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function OCRUpload({ onTextExtracted }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);

    Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.floor(m.progress * 100));
        }
      },
    }).then(({ data: { text } }) => {
      setLoading(false);
      setProgress(100);
      onTextExtracted(text);
    });
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h2 className="text-lg font-semibold mb-2">📸 OCR Text Extractor</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-2"
      />
      {loading && (
        <div className="text-sm text-blue-600">
          Processing: {progress}%...
        </div>
      )}
    </div>
  );
}
