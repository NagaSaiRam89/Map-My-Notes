import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MiniCalendar.css'; // Optional for custom styles

export default function ReviewCalendar({ reviewedDates = [] }) {
  const highlightedDates = reviewedDates.map(d => new Date(d));

  return (
    <div className="p-2 bg-white shadow rounded w-fit">
      <Calendar
        tileClassName={({ date, view }) => {
          if (
            view === 'month' &&
            highlightedDates.some(d => d.toDateString() === date.toDateString())
          ) {
            return 'highlight-date';
          }
          return null;
        }}
      />
    </div>
  );
}
