// src/components/timeslotpicker.jsx — FULL TIME SLOT PICKER + STYLIST CONFIRMATION
import React, { useState } from 'react';
import { format, addDays, startOfDay, addMinutes, isSameDay } from 'date-fns';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function TimeSlotPicker({ stylistId, onSlotSelected }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // 30-minute slots from 9 AM to 8 PM
  const generateSlots = (date) => {
    const slots = [];
    let time = startOfDay(date);
    time.setHours(9, 0, 0);
    for (let i = 0; i < 22; i++) {
      slots.push(new Date(time));
      time = addMinutes(time, 30);
    }
    return slots;
  };

  return (
    <div style={{background: NAVY, color: 'white', padding: '2rem', borderRadius: '24px'}}>
      <h2 style={{color: GOLD, textAlign: 'center'}}>Pick Your Time</h2>

      <div style={{display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0'}}>
        {dates.map(d => (
          <button
            key={d.toISOString()}
            onClick={() => setSelectedDate(d)}
            style={{
              background: isSameDay(d, selectedDate) ? GOLD : 'rgba(255,255,255,0.1)',
              color: isSameDay(d, selectedDate) ? 'black' : 'white',
              padding: '1rem',
              borderRadius: '16px',
              minWidth: '100px',
              fontWeight: 'bold'
            }}
          >
            {format(d, 'EEE')}<br/>
            {format(d, 'dd MMM')}
          </button>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem'}}>
        {generateSlots(selectedDate).map(slot => (
          <button
            key={slot.toISOString()}
            onClick={() => {
              setSelectedSlot(slot);
              onSlotSelected(slot);
            }}
            disabled={slot < new Date()} // disable past slots
            style={{
              background: selectedSlot && isSameDay(slot, selectedSlot) && slot.getTime() === selectedSlot.getTime() ? GOLD : 'rgba(255,255,255,0.1)',
              color: selectedSlot && isSameDay(slot, selectedSlot) && slot.getTime() === selectedSlot.getTime() ? 'black' : 'white',
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              opacity: slot < new Date() ? 0.5 : 1
            }}
          >
            {format(slot, 'h:mm a')}
          </button>
        ))}
      </div>
    </div>
  );
}
