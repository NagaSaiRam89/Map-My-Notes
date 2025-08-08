import React, { useState } from 'react';

export default function FlashcardReview({ cards, onReview }) {
  const [revealedId, setRevealedId] = useState(null);
  const [customInterval, setCustomInterval] = useState('');
  const [selectedInterval, setSelectedInterval] = useState(3); // default 3 days

  if (cards.length === 0)
    return <p className="text-sm italic text-gray-500 mt-4">🎉 No cards due today!</p>;

  return (
    <div className="mt-6 space-y-4">
      {cards.map((card) => (
        <div key={card.id} className="bg-white shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">📝 What to Review</h3>
          <p className="text-gray-700 mb-3">{card.question}</p>

          {revealedId === card.id && (
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-800 mb-3">
              <strong>Answer:</strong> {card.answer}
            </div>
          )}

          {revealedId !== card.id ? (
            <button
              onClick={() => setRevealedId(card.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            >
              Reveal Answer
            </button>
          ) : (
            <>
              <div className="mb-2">
                <label className="text-sm font-medium mr-2">Interval:</label>
                {[1, 3, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedInterval(d)}
                    className={`px-2 py-1 mr-1 rounded text-sm ${
                      selectedInterval === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  placeholder="Custom"
                  className="w-20 ml-2 px-2 py-1 text-sm border rounded"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(e.target.value)}
                />
              </div>

              <div className="space-x-2">
                <button
                  onClick={() =>
                    onReview(card, true, parseInt(customInterval || selectedInterval))
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Remembered
                </button>
                <button
                  onClick={() => onReview(card, false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Forgot
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
