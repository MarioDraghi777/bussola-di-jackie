import { describe, expect, it } from 'vitest';
import { formatDistance, haversineDistanceMeters } from './distance';

describe('haversineDistanceMeters', () => {
  it('ritorna 0 per lo stesso punto', () => {
    const p = { lat: 41.9028, lng: 12.4964 };
    expect(haversineDistanceMeters(p, p)).toBe(0);
  });

  it('calcola una distanza reale nota (Colosseo -> Pantheon, ~1.9 km)', () => {
    const colosseo = { lat: 41.8902, lng: 12.4922 };
    const pantheon = { lat: 41.8986, lng: 12.4769 };
    const d = haversineDistanceMeters(colosseo, pantheon);
    expect(d).toBeGreaterThan(1500);
    expect(d).toBeLessThan(2200);
  });
});

describe('formatDistance', () => {
  it('mostra i metri sotto il km', () => {
    expect(formatDistance(350)).toBe('350 m');
  });

  it('mostra i km con una virgola sopra il km', () => {
    expect(formatDistance(2300)).toBe('2,3 km');
  });

  it('arrotonda senza decimali sopra i 10 km', () => {
    expect(formatDistance(15400)).toBe('15 km');
  });
});
