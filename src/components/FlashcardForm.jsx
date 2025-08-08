import React, { useState, useRef, useEffect } from 'react';

export default function FlashcardForm({ onSubmit }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const questionRef = useRef();

  useEffect(() => {
    questionRef.current?.focus();
  }, []);

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCard = {
      id: Date.now().toString(),
      question,
      answer,
      tags,
      createdAt: new Date().toISOString(),
    };
    onSubmit(newCard);
    setQuestion('');
    setAnswer('');
    setTags([]);
    setTagInput('');
    questionRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded space-y-4">
      <input
        ref={questionRef}
        type="text"
        placeholder="Enter question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded"
      />

      <textarea
        placeholder="Enter answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded resize-y min-h-[80px]"
      />

      <div className="border rounded px-2 py-1 flex flex-wrap items-center gap-1">
        {tags.map((tag, idx) => (
          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">
            {tag}
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Add tags..."
          className="flex-1 outline-none p-1 text-sm"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Flashcard
      </button>
    </form>
  );
}
