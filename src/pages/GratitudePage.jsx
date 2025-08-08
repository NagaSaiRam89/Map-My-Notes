import React, { useEffect, useState } from 'react';
import GratitudeForm from '../components/GratitudeForm';
import GratitudeEntry from '../components/GratitudeEntry';
import GratitudeCalendar from '../components/GratitudeCalendar';
import { saveGratitudeEntries } from '../utils/GoogleDriveService';
import AppLayout from '../components/AppLayout';

// The component now receives its data directly as props
export default function GratitudePage({ gratitudeEntries, setGratitudeEntries }) {
  const [editingEntry, setEditingEntry] = useState(null);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [showCalendar, setShowCalendar] = useState(false);

  // The internal useEffect to load data has been REMOVED.

  useEffect(() => {
    // Calculate streaks whenever the entries prop changes
    const streak = calculateStreaks(gratitudeEntries || []);
    setStreakData(streak);
  }, [gratitudeEntries]);

  const handleAddOrUpdateEntry = async (entry) => {
    let updated;
    if (editingEntry) {
      updated = (gratitudeEntries || []).map((e) => e.id === editingEntry.id ? entry : e);
      setEditingEntry(null);
    } else {
      updated = [entry, ...(gratitudeEntries || [])];
    }
    setGratitudeEntries(updated); // Update the state in App.js
    await saveGratitudeEntries(updated); // Save to Drive
  };

  const handleDelete = async (idToDelete) => {
    const updated = (gratitudeEntries || []).filter((e) => e.id !== idToDelete);
    setGratitudeEntries(updated); // Update the state in App.js
    await saveGratitudeEntries(updated); // Save to Drive
  };

  function calculateStreaks(entries) {
    if (!entries || entries.length === 0) return { currentStreak: 0, longestStreak: 0, lastEntryDate: null };
    // Your existing calculateStreaks logic is fine, no changes needed
    const seenDates = new Set(entries.map(e => e.date));
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let lastEntryDate = null;
    let streakContinues = true;

    for (let i = 0; i < 365 && streakContinues; i++) {
        const checkDate = new Date();
        checkDate.setDate(today.getDate() - i);
        const checkStr = checkDate.toISOString().split('T')[0];

        if (seenDates.has(checkStr)) {
            currentStreak++;
            if (!lastEntryDate) lastEntryDate = checkStr;
        } else {
            if (i > 0) streakContinues = false; // Stop if a day is missed (but allow today to be empty)
        }
        longestStreak = Math.max(longestStreak, currentStreak);
    }
    return { currentStreak, longestStreak, lastEntryDate };
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">🌞 Daily Gratitude</h2>
        <div className="bg-yellow-50 p-4 rounded-md mb-4 border border-yellow-300">
          <p className="text-lg font-semibold">🔥 Current Streak: {streakData.currentStreak} day(s)</p>
          <p className="text-sm text-gray-600">🏆 Longest Streak: {streakData.longestStreak} day(s)</p>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="mt-2 px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500"
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar View'}
          </button>
          {showCalendar && <GratitudeCalendar entries={gratitudeEntries || []} />}
        </div>
        <GratitudeForm onSubmit={handleAddOrUpdateEntry} initialData={editingEntry} />
        <div className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto">
          {(gratitudeEntries || []).map((entry) => (
            <GratitudeEntry
              key={entry.id}
              entry={entry}
              onEdit={setEditingEntry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}