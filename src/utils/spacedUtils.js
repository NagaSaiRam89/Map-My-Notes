import { loadStreak,saveStreak } from '../utils/GoogleDriveService'
export function updateFlashcard(card, remembered, overrideDays = null) {
  const now = new Date();
  const nextCard = { ...card };
  nextCard.lastReviewed = now.toISOString();
  nextCard.reviewCount = (nextCard.reviewCount || 0) + 1;

  if (remembered) {
    if (overrideDays) {
      nextCard.intervalDays = overrideDays;
    } else {
      nextCard.easeFactor = Math.max(1.3, (nextCard.easeFactor || 2.5) + 0.1);
      nextCard.intervalDays = Math.ceil(
        (nextCard.intervalDays || 1) * nextCard.easeFactor
      );
    }
  } else {
    nextCard.easeFactor = Math.max(1.3, (nextCard.easeFactor || 2.5) - 0.2);
    nextCard.intervalDays = 1;
  }

  const nextReview = new Date();
  nextReview.setDate(now.getDate() + nextCard.intervalDays);
  nextCard.nextReviewDate = nextReview.toISOString().split('T')[0];

  return nextCard;
}

export async function updateReviewStreak() {
  const today = new Date().toISOString().split('T')[0];
  const data = await loadStreak(); // Load from Drive
  const last = data?.lastDate;
  const streakCount = data?.count || 0;
  const history = data?.history || [];

  let updatedCount = streakCount;

  if (!last) {
    updatedCount = 1;
  } else {
    const lastDate = new Date(last);
    const diff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));

    if (diff === 1) updatedCount += 1;
    else if (diff > 1) updatedCount = 1;
  }

  const updated = {
    lastDate: today,
    count: updatedCount,
    history: [...new Set([...history, today])],
  };

  await saveStreak(updated); // Save to Drive
  return updated;
}


