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
      
        <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
           <h3 className="text-lg font-bold mb-2">🔥 Your Gratitude Streak</h3>
           <div className="flex items-center justify-between">
              <div>
                 <p>Current Streak: <span className="font-bold text-primary">{streakData.currentStreak} day(s)</span></p>
                 <p>Longest Streak: <span className="font-bold">{streakData.longestStreak} day(s)</span></p>
              </div>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                {showCalendar ? 'Hide Calendar' : 'View Calendar'}
              </button>
           </div>
           {showCalendar && <div className="mt-4"><GratitudeCalendar entries={gratitudeEntries || []} /></div>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-4">What are you grateful for today?</h3>
            
        <GratitudeForm onSubmit={handleAddOrUpdateEntry} initialData={editingEntry} />
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Past Entries</h3>
          {(gratitudeEntries || []).length > 0 ? (
            (gratitudeEntries || []).map((entry) => (
              <GratitudeEntry
                key={entry.id}
                entry={entry}
                onEdit={setEditingEntry}
              onDelete={handleDelete}
              />
              ))
            ) : (
              <p className="text-gray-500 italic">No entries yet. Add one above to get started!</p>
            )}
          </div>
        </div>
      </AppLayout>
  );
}
