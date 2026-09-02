import { db } from './schema';
import type { Place } from '../types';

/**
 * Il dataset personale è dell'ordine delle centinaia di voci: tutte le query
 * di filtro/ordinamento "intelligenti" (distanza, testo, combinazioni di filtri)
 * si fanno in memoria negli store, qui restano solo le operazioni sul DB.
 */

export function listPlaces(): Promise<Place[]> {
  return db.places.toArray();
}

export function getPlace(id: string): Promise<Place | undefined> {
  return db.places.get(id);
}

export async function createPlace(place: Place): Promise<void> {
  await db.places.add(place);
}

export async function updatePlace(id: string, changes: Partial<Place>): Promise<void> {
  await db.places.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deletePlace(id: string): Promise<void> {
  await db.places.delete(id);
}

export async function bulkAddPlaces(places: Place[]): Promise<void> {
  await db.places.bulkAdd(places);
}

export async function distinctCities(): Promise<string[]> {
  const all = await db.places.toArray();
  return Array.from(new Set(all.map((p) => p.city).filter(Boolean))).sort();
}

export async function distinctTags(): Promise<string[]> {
  const all = await db.places.toArray();
  const set = new Set<string>();
  for (const p of all) for (const t of p.tags) set.add(t);
  return Array.from(set).sort();
}
