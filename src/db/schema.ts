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

    // v2: le categorie passano da 6 "famiglie cromatiche" condivise a un colore
    // libero per categoria. Le installazioni già in uso (categorie salvate con
    // il vecchio campo colorFamily) vengono migrate qui, una volta sola.
    const legacyFamilyHex: Record<number, string> = {
      1: '#2a78d6',
      2: '#eb6834',
      3: '#1baf7a',
      4: '#eda100',
      5: '#e87ba4',
      6: '#008300',
    };
    this.version(2)
      .stores({
        places: 'id, name, city, status, *categories, *tags, updatedAt',
        categories: 'id, order',
        geocodeCache: 'query, timestamp',
      })
      .upgrade(async (tx) => {
        await tx
          .table('categories')
          .toCollection()
          .modify((cat: Category & { colorFamily?: number }) => {
            if (!cat.color) {
              cat.color = legacyFamilyHex[cat.colorFamily ?? 1] ?? '#2a78d6';
            }
          });
      });
  }
}

export const db = new BussolaDB();
