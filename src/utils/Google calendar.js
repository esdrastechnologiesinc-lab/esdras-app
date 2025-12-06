// src/utils/googleCalendar.js
export const addToBothCalendars = async (time, stylist, styleName) => {
  const event = {
    summary: `ESDRAS Booking: ${styleName}`,
    description: `Booked via ESDRAS app with ${stylist.shopName || stylist.name}`,
    start: { dateTime: time.toISOString() },
    end: { dateTime: new Date(time.getTime() + 60*60*1000).toISOString() }, // 1 hour
    attendees: [{ email: auth.currentUser.email }, { email: stylist.email }]
  };

  // Call Google Calendar API via Firebase Function or OAuth
  // For MVP: Use simple iCal link
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${format(time, "yyyyMMdd'T'HHmmss")}`,
    `DTEND:${format(new Date(time.getTime() + 3600000), "yyyyMMdd'T'HHmmss")}`,
    `SUMMARY:ESDRAS Booking - ${styleName}`,
    `DESCRIPTION:With ${stylist.shopName}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'esdras-booking.ics';
  a.click();
};
