import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays } from 'date-fns';

export default function GratitudeCalendar({ entries }) {
    const today = new Date();
    const values = entries.map((entry) => ({
      date: entry.date,
      count: 1,
      title: entry.title,
    }));
  
    return (
      <div
        className="p-2"
        style={{
          width: '280px', // You can adjust between 250–300px
          overflowX: 'auto',
          fontSize: '10px', // smaller cells
        }}
      >
        <CalendarHeatmap
          startDate={subDays(today, 90)}
          endDate={today}
          values={values}
          gutterSize={1}
          classForValue={(value) => {
            if (!value) return 'color-empty';
            return 'color-filled';
          }}
          showWeekdayLabels={false}
        />
      </div>
    );
  }
  