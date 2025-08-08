import React from 'react';

export default function FlashcardList({ cards, onDelete }) {
  return (
    <div className="space-y-3">
      {cards.length === 0 && (
        <p className="text-gray-600 italic">No flashcards yet.</p>
      )}
      {cards.map((card) => (
        <div key={card.id} className="border p-3 rounded-md bg-gray-50">
          <p><strong>Q:</strong> {card.question}</p>
          <p><strong>A:</strong> {card.answer}</p>
          <button
            onClick={() => onDelete(card.id)}
            className="text-red-500 text-sm mt-1"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
