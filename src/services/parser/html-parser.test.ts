import { describe, it, expect } from 'vitest';
import { parseTimestamp } from './html-parser';

describe('parseTimestamp', () => {
  it('should return 0 for empty strings', () => {
    expect(parseTimestamp('')).toBe(0);
  });

  it('should parse ISO strings using native Date.parse', () => {
    const isoString = '2026-02-15T10:30:00.000Z';
    expect(parseTimestamp(isoString)).toBe(Date.parse(isoString));
  });

  it('should parse Vietnamese format "15 thg 2, 2026, 10:30"', () => {
    const str = '15 thg 2, 2026, 10:30';
    const expected = new Date(2026, 1, 15, 10, 30).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });

  it('should parse Vietnamese format variations (single digit day/month, different spacing)', () => {
    const str = '1 thg 1 2026 08:05';
    const expected = new Date(2026, 0, 1, 8, 5).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });

  it('should parse slash format "15/02/2026 10:30"', () => {
    const str = '15/02/2026 10:30';
    const expected = new Date(2026, 1, 15, 10, 30).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });

  it('should parse slash format variations (single digit day/month/hour/minute)', () => {
    const str = '1/1/2026 8:5';
    const expected = new Date(2026, 0, 1, 8, 5).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });

  it('should return 0 for unrecognized strings', () => {
    expect(parseTimestamp('not a date')).toBe(0);
    expect(parseTimestamp('Jan 32, 2026')).toBe(0);
  });

  it('should handle leap years correctly', () => {
    const str = '29/02/2024 10:30';
    const expected = new Date(2024, 1, 29, 10, 30).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });

  it('should handle end of year correctly', () => {
    const str = '31/12/2025 23:59';
    const expected = new Date(2025, 11, 31, 23, 59).getTime();
    expect(parseTimestamp(str)).toBe(expected);
  });
});
