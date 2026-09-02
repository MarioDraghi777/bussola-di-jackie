import Dexie, { type Table } from 'dexie';
import type { Category, GeocodeCacheEntry, Place } from '../types';

/**
 * Unico database locale dell'app (IndexedDB via Dexie).
 * Tutto vive sul dispositivo: nessuna chiamata di rete per leggere/scrivere dati.
 */
export class BussolaDB extends Dexie {
  places!: Table<Place, string>;
  categories!: Table<Category, string>;
  geocodeCache!: Table<GeocodeCacheEntry, string>;

  constructor() {
    super('bussola-di-jackie');
    // '*categories' e '*tags' sono indici multiEntry: permettono query rapide
    // "tutti i posti che hanno la categoria X" senza scansionare l'intera tabella.
    this.version(1).stores({
      places: 'id, name, city, status, *categories, *tags, updatedAt',
      categories: 'id, order',
      geocodeCache: 'query, timestamp',
    });
  }
}

export const db = new BussolaDB();
