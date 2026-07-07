import { describe, it, expect } from 'vitest';
import { buildIcalDocument } from './ical-export.js';

describe('ical-export', () => {
  it('builds valid VCALENDAR with habit all-day events', () => {
    const ics = buildIcalDocument({
      habits: [{ id: 'h1', name: 'Read', history: ['2026-05-30'], description: 'Books' }]
    });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('UID:h1-2026-05-30@cultiva.local');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260530');
    expect(ics).toContain('SUMMARY:Read — Cultiva');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('includes timed calendar events when present', () => {
    const ics = buildIcalDocument({
      habits: [],
      calendarEvents: {
        '2026-05-30': [{ id: 'e1', title: 'Meeting', time: '14:30' }]
      }
    });
    expect(ics).toContain('DTSTART:20260530T143000');
    expect(ics).toContain('SUMMARY:Meeting');
  });
});
