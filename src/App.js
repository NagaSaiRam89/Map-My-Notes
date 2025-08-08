import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ReactFlowProvider } from 'reactflow';

// Import Pages
import GratitudePage from './pages/GratitudePage';
import SpacedPage from './pages/SpacedPage';
import NotesPage from './pages/NotePage';
import ConceptMapPage from './pages/ConceptMapPage';
import NoteEditorPage from './pages/NoteEditorPage';

// Import ALL data loaders from your single service file
import {
  initGapiClient,
  loadNotesFromDrive,
  loadFlashcards,
  loadGratitudeEntries,
  loadStreak,
} from './utils/GoogleDriveService';

// This new component contains the main logic after context is available
function AppContent() {
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [streak, setStreak] = useState({});
  const { accessToken } = useAuth();

  // This single useEffect loads ALL data for the entire app, but only after login
  useEffect(() => {
    async function loadAllData() {
      if (accessToken) {
        try {
          console.log("Access Token available. Initializing GAPI client...");
          await initGapiClient(accessToken);
          console.log("GAPI client initialized. Loading all user data...");
          
          // Fetch all data in parallel for better performance
          const [notesData, flashcardsData, gratitudeData, streakData] = await Promise.all([
            loadNotesFromDrive(),
            loadFlashcards(),
            loadGratitudeEntries(),
            loadStreak(),
          ]);

          setNotes(Array.isArray(notesData) ? notesData : []);
          setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : []);
          setGratitudeEntries(Array.isArray(gratitudeData) ? gratitudeData : []);
          setStreak(streakData || {});
          
          console.log("✅ All user data loaded from Google Drive.");

        } catch (error) {
          console.error("Failed to load data after login:", error);
        }
      }
    }
    loadAllData();
  }, [accessToken]); // This effect re-runs only when the user logs in

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/notes" />} />

        {/* ✅ Pass the centrally managed state down to each page as props */}
        <Route 
          path="/notes" 
          element={<NotesPage notes={notes} setNotes={setNotes} />} 
        />
        <Route 
          path="/note/:noteId" 
          element={<NoteEditorPage />} 
        />
        <Route 
          path="/daily-gratitude" 
          element={<GratitudePage gratitudeEntries={gratitudeEntries} setGratitudeEntries={setGratitudeEntries} />} 
        />
        <Route 
          path="/spaced-learning" 
          element={<SpacedPage flashcards={flashcards} setFlashcards={setFlashcards} streak={streak} setStreak={setStreak} />} 
        />
        
        <Route
          path="/concept-map"
          element={
            <ReactFlowProvider>
              <ConceptMapPage notes={notes} />
            </ReactFlowProvider>
          }
        />
         <Route
          path="/concept-map/:mapId"
          element={
            <ReactFlowProvider>
              <ConceptMapPage notes={notes} />
            </ReactFlowProvider>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <AppContent />
    </AuthProvider>
  );
}

export default App;