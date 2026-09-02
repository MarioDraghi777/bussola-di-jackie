import { db } from './schema';
import type { Category } from '../types';

/**
 * Categorie di serie, quelle richieste esplicitamente dall'utente.
 * Sono il seed iniziale della tabella `categories`: dopo il primo avvio
 * vivono nel database e sono modificabili/estendibili dalla UI, non da qui.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'colazione_caffe', label: 'Colazione/caffè', emoji: '☕', colorFamily: 1, builtIn: true, order: 1 },
  { id: 'pasticceria_forno', label: 'Pasticceria e forno', emoji: '🥐', colorFamily: 1, builtIn: true, order: 2 },
  { id: 'gelateria', label: 'Gelateria', emoji: '🍦', colorFamily: 1, builtIn: true, order: 3 },
  { id: 'libreria_caffe', label: 'Libreria-caffè', emoji: '📚', colorFamily: 1, builtIn: true, order: 4 },

  { id: 'pranzo', label: 'Pranzo', emoji: '🍝', colorFamily: 2, builtIn: true, order: 5 },
  { id: 'cena', label: 'Cena', emoji: '🍽️', colorFamily: 2, builtIn: true, order: 6 },
  { id: 'pizzeria', label: 'Pizzeria', emoji: '🍕', colorFamily: 2, builtIn: true, order: 7 },
  { id: 'street_food', label: 'Street food', emoji: '🌮', colorFamily: 2, builtIn: true, order: 8 },
  { id: 'ristorante_etnico', label: 'Ristorante etnico', emoji: '🍜', colorFamily: 2, builtIn: true, order: 9 },

  { id: 'aperitivo', label: 'Aperitivo', emoji: '🍹', colorFamily: 3, builtIn: true, order: 10 },
  { id: 'cocktail_bar', label: 'Cocktail bar', emoji: '🍸', colorFamily: 3, builtIn: true, order: 11 },
  { id: 'enoteca', label: 'Enoteca', emoji: '🍷', colorFamily: 3, builtIn: true, order: 12 },
  { id: 'rooftop', label: 'Rooftop', emoji: '🏙️', colorFamily: 3, builtIn: true, order: 13 },
  { id: 'locale_musica', label: 'Locale con musica', emoji: '🎵', colorFamily: 3, builtIn: true, order: 14 },

  { id: 'museo', label: 'Museo', emoji: '🏛️', colorFamily: 4, builtIn: true, order: 15 },
  { id: 'attrazione', label: 'Attrazione', emoji: '🎟️', colorFamily: 4, builtIn: true, order: 16 },
  { id: 'punto_panoramico', label: 'Punto panoramico', emoji: '🌄', colorFamily: 4, builtIn: true, order: 17 },
  { id: 'parco', label: 'Parco', emoji: '🌳', colorFamily: 4, builtIn: true, order: 18 },

  { id: 'albergo', label: 'Albergo', emoji: '🛏️', colorFamily: 5, builtIn: true, order: 19 },

  { id: 'negozio', label: 'Negozio', emoji: '🛍️', colorFamily: 6, builtIn: true, order: 20 },
];

/** Inserisce le categorie di serie al primo avvio. Idempotente: non tocca nulla se già presenti. */
export async function ensureCategoriesSeeded(): Promise<void> {
  const count = await db.categories.count();
  if (count === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }
}

export function listCategories(): Promise<Category[]> {
  return db.categories.orderBy('order').toArray();
}

export async function addCategory(input: Omit<Category, 'builtIn' | 'order'>): Promise<void> {
  const maxOrder = (await db.categories.orderBy('order').last())?.order ?? 0;
  await db.categories.add({ ...input, builtIn: false, order: maxOrder + 1 });
}

export async function updateCategory(id: string, changes: Partial<Pick<Category, 'label' | 'emoji' | 'colorFamily'>>): Promise<void> {
  await db.categories.update(id, changes);
}

/**
 * Elimina una categoria personalizzata. Le categorie di serie non si possono eliminare
 * (solo rinominare) per non rompere il mapping automatico dell'import.
 * I posti che la usavano non vengono toccati nei dati, solo scollegati dalla categoria.
 */
export async function deleteCategory(id: string): Promise<void> {
  const category = await db.categories.get(id);
  if (!category || category.builtIn) return;

  await db.transaction('rw', db.categories, db.places, async () => {
    const affected = await db.places.where('categories').equals(id).toArray();
    for (const place of affected) {
      await db.places.update(place.id, {
        categories: place.categories.filter((c) => c !== id),
        updatedAt: Date.now(),
      });
    }
    await db.categories.delete(id);
  });
}

export async function categoryUsageCount(id: string): Promise<number> {
  return db.places.where('categories').equals(id).count();
}
