import React, { useEffect, useState } from 'react';
import GratitudeForm from '../components/GratitudeForm';
import GratitudeEntry from '../components/GratitudeEntry';
import GratitudeCalendar from '../components/GratitudeCalendar';
import {
  loadGratitudeEntries,
  saveGratitudeEntries,
} from '../utils/GoogleDriveService';
import AppLayout from '../components/AppLayout';

export default function GratitudePage() {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastEntryDate: null,
  });
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    async function fetchAndSet() {
      const data = await loadGratitudeEntries();
      setEntries(data || []);
    }
    fetchAndSet();
  }, []);

  useEffect(() => {
    const streak = calculateStreaks(entries);
    setStreakData(streak);
  }, [entries]);

  const handleAddEntry = async (newEntry) => {
    let updated;

    if (editingEntry) {
      updated = entries.map((e) =>
        e.id === editingEntry.id ? newEntry : e
      );
      setEditingEntry(null);
    } else {
      updated = [newEntry, ...entries];
    }

    setEntries(updated);
    await saveGratitudeEntries(updated);
  };

  const handleDelete = async (idToDelete) => {
    const updated = entries.filter((e) => e.id !== idToDelete);
    setEntries(updated);
    await saveGratitudeEntries(updated);
  };

  function calculateStreaks(entries) {
    const seenDates = new Set(entries.map(e => e.date));
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let lastEntryDate = null;

    for (let i = 0; ; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const checkStr = checkDate.toISOString().split('T')[0];

      if (seenDates.has(checkStr)) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
        if (!lastEntryDate) lastEntryDate = checkStr;
      } else {
        if (i === 0) continue; // allow missing today
        break;
      }
    }

    return {
      currentStreak,
      longestStreak,
      lastEntryDate,
    };
  }

  return (
    <AppLayout>
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🌞 Daily Gratitude</h2>

      <div className="bg-yellow-50 p-4 rounded-md mb-4 border border-yellow-300 flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-lg font-semibold">🔥 Current Streak: {streakData.currentStreak} day(s)</p>
          <p className="text-sm text-gray-600">🏆 Longest Streak: {streakData.longestStreak} day(s)</p>
          <p className="text-sm text-gray-500">🕒 Last Entry: {streakData.lastEntryDate || 'None yet'}</p>

          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="mt-2 px-3 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500"
          >
            {showCalendar ? 'Hide Calendar View' : 'Show Calendar View'}
          </button>
        </div>

        {showCalendar && (
          <div className="mt-1 w-full">
            <GratitudeCalendar entries={entries} />
          </div>
        )}
      </div>

      <GratitudeForm
        onSubmit={handleAddEntry}
        initialData={editingEntry}
      />

      <div className="space-y-4 mt-6 max-h-[60vh] overflow-y-auto">
        {entries.map((entry) => (
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
