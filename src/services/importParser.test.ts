import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inferCityFromTitle, parseImportText } from './importParser';

const SEED_PATH = new URL('../../public/seed/locali-roma.txt', import.meta.url);
const seedText = readFileSync(SEED_PATH, 'utf-8');

function findRow(rows: ReturnType<typeof parseImportText>, name: string) {
  const row = rows.find((r) => r.name === name);
  if (!row) throw new Error(`Riga non trovata per "${name}"`);
  return row;
}

describe('inferCityFromTitle', () => {
  it('legge "Roma" dal titolo del file reale', () => {
    expect(inferCityFromTitle(seedText)).toBe('Roma');
  });
});

describe('parseImportText sul file reale Locali Roma.txt', () => {
  const rows = parseImportText(seedText, 'Roma');

  it('produce una riga per ogni voce puntata non vuota (140 bullet, 1 vuoto)', () => {
    expect(rows).toHaveLength(139);
  });

  it('assegna la città di default a tutte le righe', () => {
    expect(rows.every((r) => r.city === 'Roma')).toBe(true);
  });

  it('mappa la sezione Colazione sulla categoria colazione_caffe', () => {
    const row = findRow(rows, 'Patisserie Peruca');
    expect(row.suggestedCategories).toEqual(['colazione_caffe']);
  });

  it('riconosce "anche pranzo" come categoria aggiuntiva', () => {
    const row = findRow(rows, 'Charlotte');
    expect(row.suggestedCategories.sort()).toEqual(['colazione_caffe', 'pranzo']);
  });

  it('estrae la fermata metro come tag e mantiene il testo originale in nota', () => {
    const row = findRow(rows, 'Love Specialty Crossaints');
    expect(row.suggestedTags).toContain('metro ottaviano');
    expect(row.notes).toContain('Ottaviano');
  });

  it('gestisce più parentesi separate (fermata + anche brunch o pranzo)', () => {
    const row = findRow(rows, 'Materia Cafe');
    expect(row.suggestedTags).toContain('metro san giovanni');
    expect(row.suggestedTags).toContain('brunch');
    expect(row.suggestedCategories).toContain('pranzo');
    expect(row.suggestedCategories).toContain('colazione_caffe');
  });

  it('mappa Pranzo/cena su entrambe le categorie', () => {
    const row = findRow(rows, 'Vetro');
    expect(row.suggestedCategories.sort()).toEqual(['cena', 'pranzo']);
  });

  it('riconosce la cucina etnica fra parentesi', () => {
    const row = findRow(rows, 'Igio');
    expect(row.cuisine).toBe('coreano');
    expect(row.suggestedCategories).toContain('ristorante_etnico');
  });

  it('riconosce parole chiave nel nome/parentesi per categorie della sezione mista', () => {
    expect(findRow(rows, 'Mun rooftop').suggestedCategories).toContain('rooftop');
    expect(findRow(rows, 'Enoteca l’antidoto').suggestedCategories).toContain('enoteca');
    expect(findRow(rows, 'Gregory’s Jazz club').suggestedCategories).toContain('locale_musica');
    expect(findRow(rows, 'Radiasson').suggestedCategories).toContain('albergo');
    expect(findRow(rows, 'Iacuzzilli').suggestedCategories).toContain('pizzeria');
    expect(findRow(rows, 'La renella').suggestedCategories).toContain('pasticceria_forno');
  });

  it('non perde mai il testo originale delle parentesi, anche quando non lo capisce', () => {
    const row = findRow(rows, 'Bottiglieria Pigneto');
    expect(row.notes).toContain('easy');
  });

  it('salta le righe puntate vuote', () => {
    expect(rows.some((r) => r.name === '')).toBe(false);
  });
});
