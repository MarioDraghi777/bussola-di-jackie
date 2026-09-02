import { describe, expect, it } from 'vitest';
import type { Place } from '../types';
import { computeFilteredPlaces, DEFAULT_FILTERS } from './filtering';

function makePlace(overrides: Partial<Place>): Place {
  return {
    id: overrides.id ?? 'p1',
    name: 'Bar della cometa',
    city: 'Roma',
    categories: ['aperitivo'],
    tags: ['zozzone'],
    status: 'da_provare',
    lat: 41.9,
    lng: 12.47,
    geocodeSource: 'nominatim',
    notes: '',
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe('computeFilteredPlaces', () => {
  const places = [
    makePlace({ id: 'a', name: 'Vetro', categories: ['cena'], tags: [], city: 'Roma', lat: 41.9, lng: 12.47 }),
    makePlace({ id: 'b', name: 'Sottosopra', categories: ['aperitivo'], tags: ['estivo'], city: 'Roma', lat: 42.0, lng: 12.6 }),
    makePlace({ id: 'c', name: 'Museo Bar', categories: ['museo'], tags: [], city: 'Milano', lat: 45.46, lng: 9.19 }),
  ];

  it('senza filtri ritorna tutto ordinato per nome', () => {
    const result = computeFilteredPlaces(places, DEFAULT_FILTERS, null);
    expect(result.map((r) => r.place.name)).toEqual(['Museo Bar', 'Sottosopra', 'Vetro']);
  });

  it('filtra per testo libero (nome)', () => {
    const result = computeFilteredPlaces(places, { ...DEFAULT_FILTERS, text: 'vetro' }, null);
    expect(result.map((r) => r.place.id)).toEqual(['a']);
  });

  it('filtra per categoria', () => {
    const result = computeFilteredPlaces(places, { ...DEFAULT_FILTERS, categories: ['aperitivo'] }, null);
    expect(result.map((r) => r.place.id)).toEqual(['b']);
  });

  it('filtra per città', () => {
    const result = computeFilteredPlaces(places, { ...DEFAULT_FILTERS, city: 'Milano' }, null);
    expect(result.map((r) => r.place.id)).toEqual(['c']);
  });

  it('filtra per raggio di distanza quando c’è una posizione', () => {
    const pos = { lat: 41.9, lng: 12.47 };
    const result = computeFilteredPlaces(places, { ...DEFAULT_FILTERS, maxDistanceKm: 5 }, pos);
    expect(result.map((r) => r.place.id)).toEqual(['a']);
  });

  it('ordina per distanza quando richiesto', () => {
    const pos = { lat: 41.9, lng: 12.47 };
    const result = computeFilteredPlaces(places, { ...DEFAULT_FILTERS, sortBy: 'distanza' }, pos);
    expect(result.map((r) => r.place.id)).toEqual(['a', 'b', 'c']);
    expect(result[0].distanceMeters).toBe(0);
  });

  it('combina più filtri insieme', () => {
    const result = computeFilteredPlaces(
      places,
      { ...DEFAULT_FILTERS, city: 'Roma', categories: ['aperitivo'], tags: ['estivo'] },
      null,
    );
    expect(result.map((r) => r.place.id)).toEqual(['b']);
  });
});
