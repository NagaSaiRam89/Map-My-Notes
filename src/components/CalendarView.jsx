import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ streak }) {
  const markedDates = Object.keys(streak || {});

  const tileClassName = ({ date }) => {
    const dateString = date.toISOString().split('T')[0];
    if (markedDates.includes(dateString)) {
      return 'bg-green-400 text-white rounded-full';
    }
  };

  return (
    <div className="p-2 border rounded-lg shadow w-fit text-sm">
      <Calendar
        tileClassName={tileClassName}
        // calendarType="US"
        showNeighboringMonth={false}
        prevLabel="<"
        nextLabel=">"
        className="text-xs"
      />
    </div>
  );
}
