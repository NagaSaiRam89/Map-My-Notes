import React, { useEffect, useState } from 'react';
import FlashcardForm from '../components/FlashcardForm';
import FlashcardList from '../components/FlashcardList';
import { v4 as uuidv4 } from 'uuid';
import { initGapiIfNeeded, saveFlashcards, loadFlashcards } from '../utils/FlashcardService';
import { useAuth } from '../context/AuthContext';
import FlashcardReview from '../components/FlashcardReview';
import { updateFlashcard } from '../utils/spacedUtils';
import toast from 'react-hot-toast';
import {
  loadStreak,
  saveStreak,
  loadFlashcardsFromDrive,
  saveToDrive,
  loadFromDrive,
} from '../utils/GoogleDriveService';
import CalendarView from '../components/CalendarView';
import IntervalPicker from '../components/IntervalPicker';
import AppLayout from '../components/AppLayout';

export async function updateReviewStreak() {
  const today = new Date().toISOString().split('T')[0];
  const streak = await loadStreak();
  if (!streak[today]) {
    streak[today] = true;
    await saveStreak(streak);
  }
  return streak;
}

export default function SpacedPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [streak, setStreak] = useState({});
  const [reviewedIds, setReviewedIds] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const { accessToken } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!accessToken) return;

    initGapiIfNeeded(accessToken).then(() => {
      loadFlashcards().then((cards) => {
        if (cards) setFlashcards(cards);
      });
    });
  }, [accessToken]);

  useEffect(() => {
    async function fetchStreak() {
      const data = await loadStreak();
      setStreak(data);
    }
    fetchStreak();
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      const cards = await loadFlashcardsFromDrive();
      setFlashcards(Array.isArray(cards) ? cards : []);
    };
    fetchCards();
  }, []);

  const fetchFlashcards = async () => {
    const raw = await loadFromDrive('flashcards.json');
    try {
      const parsed = JSON.parse(raw);
      setFlashcards(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error('Failed to parse flashcards:', e);
      setFlashcards([]);
    }
  };

  const visibleCards = Array.isArray(flashcards)
    ? flashcards.filter((card) => !filterTag || (card.tags || []).includes(filterTag))
    : [];

  const toReviewCards = visibleCards.filter(
    (card) => (!card.nextReviewDate || card.nextReviewDate <= todayStr) && !reviewedIds.includes(card.id)
  );

  const reviewedCards = visibleCards.filter((card) => reviewedIds.includes(card.id));

  const currentCard = toReviewCards.length > 0 ? toReviewCards[0] : null;

  const saveUpdatedCard = async (updatedCard) => {
    const updated = flashcards.map((card) =>
      card.id === updatedCard.id ? updatedCard : card
    );
    setFlashcards(updated);
    await saveToDrive('flashcards.json', JSON.stringify(updated));
  };

  const handleIntervalSelect = (days) => {
    if (!currentCard) return;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);

    const updatedCard = {
      ...currentCard,
      nextReviewDate: nextDate.toISOString().split('T')[0],
    };

    saveUpdatedCard(updatedCard);
    setReviewedIds((prev) => [...prev, currentCard.id]);
  };

  const handleAddCard = async (card) => {
    const updated = [card, ...flashcards];
    setFlashcards(updated);
    await saveFlashcards(updated);
  };

  const handleDeleteCard = async (id) => {
    const updated = flashcards.filter((c) => c.id !== id);
    setFlashcards(updated);
    await saveFlashcards(updated);
  };

  const handleReview = async (card, remembered, overrideInterval = null) => {
    let updatedCard = updateFlashcard(card, remembered, overrideInterval);

    const updatedList = flashcards.map((c) =>
      c.id === card.id ? updatedCard : c
    );
    setFlashcards(updatedList);
    setReviewedIds((prev) => [...prev, card.id]);
    await saveFlashcards(updatedList);

    const dueCards = updatedList.filter(
      (c) => c.nextReviewDate <= todayStr && !reviewedIds.includes(c.id)
    );

    if (dueCards.length === 0) {
      const updatedStreak = await updateReviewStreak();
      setStreak(updatedStreak);
      toast.success('🔥 All reviews done — streak updated!');
    }
  };

  const dueToday = toReviewCards.length;

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
        {dueToday > 0
          ? `📆 ${dueToday} card(s) due today`
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
