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
      <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">🧠 Spaced Repetition</h2>
          <div className="bg-white rounded-xl p-4 shadow flex flex-col gap-2 w-full sm:w-auto mb-4">
            <h2 className="text-lg font-bold">🔥 Streak</h2>
            <p>{Object.keys(streak || {}).length} days reviewed</p>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {showCalendar ? 'Hide Calendar' : 'Show Calendar View'}
            </button>
            {showCalendar && <CalendarView streak={streak} />}
          </div>
          <FlashcardForm onSubmit={handleAddCard} />
          <div className="mb-4">
            <input
              type="text"
              placeholder="Filter by tag..."
              className="border px-2 py-1 text-sm rounded"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {toReviewCards.length > 0
              ? `📆 ${toReviewCards.length} card(s) due today`
              : `✅ All reviews done for today!`}
          </p>
          <h3 className="text-lg font-semibold mt-4">📝 To Be Reviewed</h3>
          <FlashcardReview cards={toReviewCards} onReview={handleReview} />
          <div className="mt-4">
             <label className="block mb-1 text-sm font-medium">Review again in:</label>
             <IntervalPicker onSelect={handleIntervalSelect} />
           </div>
           {reviewedCards.length > 0 && (
             <>
               <h3 className="text-lg font-semibold mt-6">✅ Reviewed This Session</h3>
               <FlashcardList cards={reviewedCards} onDelete={handleDeleteCard} />
             </>
           )}
      </div>
    </AppLayout>
  );
}