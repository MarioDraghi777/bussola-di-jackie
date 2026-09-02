import { signal } from '@preact/signals';
import type { Place } from '../types';
import * as db from '../db/places';

export const places = signal<Place[]>([]);

export async function reloadPlaces(): Promise<void> {
  places.value = await db.listPlaces();
}

export async function addPlace(place: Place): Promise<void> {
  await db.createPlace(place);
  await reloadPlaces();
}

export async function editPlace(id: string, changes: Partial<Place>): Promise<void> {
  await db.updatePlace(id, changes);
  await reloadPlaces();
}

export async function removePlace(id: string): Promise<void> {
  await db.deletePlace(id);
  await reloadPlaces();
}

export async function addPlacesBulk(newPlaces: Place[]): Promise<void> {
  await db.bulkAddPlaces(newPlaces);
  await reloadPlaces();
}

export function placeById(id: string): Place | undefined {
  return places.value.find((p) => p.id === id);
}
