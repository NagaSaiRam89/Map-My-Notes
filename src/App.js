import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';

import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import GratitudePage from './pages/GratitudePage';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import SpacedPage from './pages/SpacedPage';
import NotesPage from './pages/NotePage';
import ConceptMapPage from './pages/ConceptMapPage';
import { ReactFlowProvider } from 'reactflow';
import NoteEditorPage from './pages/NoteEditorPage';

function App() {
  const [conceptMap, setConceptMap] = useState({ nodes: [], edges: [] });
  const [notes, setNotes] = useState([]); // can be populated from Drive later

  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gratitude" element={<GratitudePage />} />
          <Route path="/spaced" element={<SpacedPage />} />
          <Route path="/notes" element={<NotesPage />} />

          {/* Wrapped with ReactFlowProvider and pass props */}
          <Route
            path="/map"
            element={
              <ReactFlowProvider>
                <ConceptMapPage
                  conceptMap={conceptMap}
                  setConceptMap={setConceptMap}
                  notes={notes}
                  setNotes={setNotes}
                />
              </ReactFlowProvider>
            }
          />
          <Route
            path="/concept-map/:mapId"
            element={
              <ReactFlowProvider>
                <ConceptMapPage
                  conceptMap={conceptMap}
                  setConceptMap={setConceptMap}
                  notes={notes}
                  setNotes={setNotes}
                />
              </ReactFlowProvider>
            }
          />
          <Route path="/note/:noteId" element={<NoteEditorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
