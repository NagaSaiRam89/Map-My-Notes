import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import FlashcardForm from '../components/FlashcardForm';
import FlashcardList from '../components/FlashcardList';
import FlashcardReview from '../components/FlashcardReview';
import IntervalPicker from '../components/IntervalPicker';
import CalendarView from '../components/CalendarView';
import { updateFlashcard } from '../utils/spacedUtils';
import { saveFlashcards, saveStreak, loadStreak } from '../utils/GoogleDriveService';
import toast from 'react-hot-toast';

// This function can stay here or be moved to a utils file
export async function updateReviewStreak(currentStreak) {
  const today = new Date().toISOString().split('T')[0];
  const updatedStreak = { ...currentStreak };
  if (!updatedStreak[today]) {
    updatedStreak[today] = true;
    await saveStreak(updatedStreak);
  }
  return updatedStreak;
}

// The component now receives all its primary data as props
export default function SpacedPage({ flashcards, setFlashcards, streak, setStreak }) {
  const [reviewedIds, setReviewedIds] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // All internal useEffects for loading have been REMOVED.

  const handleAddCard = async (card) => {
    const updated = [card, ...(flashcards || [])];
    setFlashcards(updated);
    await saveFlashcards(updated);
  };

  const handleDeleteCard = async (id) => {
    const updated = (flashcards || []).filter((c) => c.id !== id);
    setFlashcards(updated);
    await saveFlashcards(updated);
  };
  
  const handleReview = async (card, remembered, overrideInterval = null) => {
    const updatedCard = updateFlashcard(card, remembered, overrideInterval);
    const updatedList = (flashcards || []).map((c) => c.id === card.id ? updatedCard : c);
    setFlashcards(updatedList);
    setReviewedIds((prev) => [...prev, card.id]);
    await saveFlashcards(updatedList);
    
    // Check if review session is complete
    const todayStr = new Date().toISOString().split('T')[0];
    const remainingToReview = updatedList.filter(
      (c) => (!c.nextReviewDate || c.nextReviewDate <= todayStr) && !reviewedIds.includes(c.id) && c.id !== card.id
    );

    if (remainingToReview.length === 0) {
      const newStreak = await updateReviewStreak(streak);
      setStreak(newStreak);
      toast.success('🔥 All reviews done — streak updated!');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const safeFlashcards = flashcards || [];

  const visibleCards = filterTag 
    ? safeFlashcards.filter(card => (card.tags || []).includes(filterTag))
    : safeFlashcards;

  const toReviewCards = visibleCards.filter(
    (card) => (!card.nextReviewDate || card.nextReviewDate <= todayStr) && !reviewedIds.includes(card.id)
  );

  const reviewedCards = visibleCards.filter((card) => reviewedIds.includes(card.id));
  const currentCard = toReviewCards.length > 0 ? toReviewCards[0] : null;

  const handleIntervalSelect = (days) => {
      if (!currentCard) return;
      handleReview(currentCard, true, days);
  };

  return (
    <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Controls and Form */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-2">🔥 Review Streak</h3>
            <p className="text-gray-600">{Object.keys(streak || {}).length} days reviewed</p>
            <button
              className="text-sm text-primary hover:underline mt-2"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {showCalendar ? 'Hide Calendar' : 'Show Calendar View'}
            </button>
            {showCalendar && <div className="mt-4"><CalendarView streak={streak} /></div>}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-2">➕ Add Flashcard</h3>
          <FlashcardForm onSubmit={handleAddCard} />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
             <label htmlFor="filter-tag" className="block text-sm font-medium text-gray-700">Filter by Tag</label>
             <input
               id="filter-tag"
               type="text"
               placeholder="Enter tag..."
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
               value={filterTag}
               onChange={(e) => setFilterTag(e.target.value)}
             />
          </div>
        </div>

        {/* Right Column: Review Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-2">📝 To Be Reviewed ({toReviewCards.length})</h3>
            <FlashcardReview cards={toReviewCards} onReview={handleReview} />
            {toReviewCards.length > 0 &&
                <div className="mt-4 border-t pt-4">
                    <label className="block mb-2 text-sm font-medium">Review again in:</label>
                    <IntervalPicker onSelect={handleIntervalSelect} />
                    </div>
            }
          </div>
          {(reviewedCards.length > 0) && (
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-bold mb-2">✅ Reviewed This Session</h3>
              <FlashcardList cards={reviewedCards} onDelete={handleDeleteCard} />
              </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}