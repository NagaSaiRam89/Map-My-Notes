// Utility to extract unique keywords from notes
export function fetchKeywordsFromNotes(notes) {
    const keywords = new Set();
  
    notes.forEach(note => {
      if (note.keywords && Array.isArray(note.keywords)) {
        note.keywords.forEach(k => keywords.add(k));
      }
    });
  
    return Array.from(keywords);
  }
  