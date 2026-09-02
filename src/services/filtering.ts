import type { Place, PlaceStatus } from '../types';
import { haversineDistanceMeters } from './distance';
import { normalizeName } from './textSimilarity';

export interface FilterState {
  text: string;
  categories: string[]; // vuoto = tutte
  tags: string[]; // vuoto = tutti
  statuses: PlaceStatus[]; // vuoto = tutti
  city: string; // '' = tutte le città
  maxDistanceKm: number | null; // null = nessun filtro di distanza
  sortBy: 'nome' | 'distanza' | 'aggiornamento';
}

export const DEFAULT_FILTERS: FilterState = {
  text: '',
  categories: [],
  tags: [],
  statuses: [],
  city: '',
  maxDistanceKm: null,
  sortBy: 'nome',
};

export interface PlaceWithDistance {
  place: Place;
  distanceMeters?: number;
}

/**
 * Applica tutti i filtri combinabili e ordina il risultato. Pura: nessuna
 * dipendenza da signal/DOM, così è testabile senza ambiente browser.
 */
export function computeFilteredPlaces(
  allPlaces: Place[],
  filters: FilterState,
  currentPosition: { lat: number; lng: number } | null,
): PlaceWithDistance[] {
  const normText = normalizeName(filters.text);

  let result: PlaceWithDistance[] = allPlaces
    .filter((p) => {
      if (normText && !normalizeName(`${p.name} ${p.notes} ${p.tags.join(' ')}`).includes(normText)) return false;
      if (filters.categories.length && !filters.categories.some((c) => p.categories.includes(c))) return false;
      if (filters.tags.length && !filters.tags.some((t) => p.tags.includes(t))) return false;
      if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
      if (filters.city && p.city !== filters.city) return false;
      return true;
    })
    .map((place) => ({
      place,
      distanceMeters: currentPosition ? haversineDistanceMeters(currentPosition, place) : undefined,
    }));

  if (filters.maxDistanceKm != null && currentPosition) {
    const maxMeters = filters.maxDistanceKm * 1000;
    result = result.filter((r) => (r.distanceMeters ?? Infinity) <= maxMeters);
  }

  result.sort((a, b) => {
    if (filters.sortBy === 'distanza') {
      return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
    }
    if (filters.sortBy === 'aggiornamento') {
      return b.place.updatedAt - a.place.updatedAt;
    }
    return a.place.name.localeCompare(b.place.name, 'it');
  });

  return result;
}
