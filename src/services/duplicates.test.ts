import { describe, expect, it } from 'vitest';
import type { Place } from '../types';
import { findPossibleDuplicates } from './duplicates';

function makePlace(overrides: Partial<Place>): Place {
  return {
    id: 'p1',
    name: 'Retrobottega',
    city: 'Roma',
    categories: ['cena'],
    tags: [],
    status: 'da_provare',
    lat: 41.9,
    lng: 12.47,
    geocodeSource: 'nominatim',
    notes: '',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('findPossibleDuplicates', () => {
  it('segnala un nome molto simile', () => {
    const existing = [makePlace({})];
    const matches = findPossibleDuplicates({ name: 'Retro Bottega' }, existing);
    expect(matches).toHaveLength(1);
    expect(matches[0].reason).toBe('nome');
  });

  it('segnala coordinate vicinissime anche con nome diverso', () => {
    const existing = [makePlace({ name: 'Vetro' })];
    const matches = findPossibleDuplicates({ name: 'Vetro Ristorante Bis', lat: 41.9001, lng: 12.4701 }, existing);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('non segnala nulla per nome e posizione entrambi diversi', () => {
    const existing = [makePlace({})];
    const matches = findPossibleDuplicates({ name: 'Trattoria Completamente Diversa', lat: 45.0, lng: 9.0 }, existing);
    expect(matches).toHaveLength(0);
  });
});
