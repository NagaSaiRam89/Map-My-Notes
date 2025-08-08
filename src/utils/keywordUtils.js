// Basic keyword extractor using frequency (for demo)
export function extractKeywords(text, limit = 5) {
    if (!text) return [];
  
    const stopWords = new Set([
      'the', 'is', 'in', 'at', 'which', 'on', 'a', 'an', 'of', 'and', 'to', 'it', 'for', 'by', 'with', 'as', 'are',
      'this', 'that', 'be', 'from', 'or', 'has', 'was', 'have', 'but', 'not', 'we', 'can'
    ]);
  
    const words = text
      .toLowerCase()
      .match(/\b[a-z]{3,}\b/g)
      ?.filter((w) => !stopWords.has(w)) || [];
  
    const freqMap = {};
    for (const word of words) {
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  
    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }
  