import type { ImportDraftRow } from '../types';
import { normalizeName } from './textSimilarity';
import { newId } from '../utils/id';

const BULLET = '◦';

interface SectionDefaults {
  categories: string[];
}

/** Riconosce l'intestazione di sezione del file (case/accent-insensitive) e la mappa sulle categorie di default. */
function sectionDefaultsFor(headerLine: string): SectionDefaults {
  const norm = normalizeName(headerLine);
  const hasPranzo = norm.includes('pranzo');
  const hasCena = norm.includes('cena');

  if (norm.includes('colazione')) return { categories: ['colazione_caffe'] };
  if (hasPranzo && hasCena) return { categories: ['pranzo', 'cena'] };
  if (hasPranzo) return { categories: ['pranzo'] };
  if (hasCena) return { categories: ['cena'] };
  if (norm.includes('sfizi') || norm.includes('aperitivo') || norm.includes('drink') || /\bape\b/.test(norm)) {
    return { categories: ['aperitivo'] };
  }
  return { categories: [] };
}

/** Prova a leggere la città dal titolo del file ("Locali da provare a Roma" -> "Roma"). */
export function inferCityFromTitle(text: string): string | undefined {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0);
  if (!firstLine) return undefined;
  const match = firstLine.trim().match(/\ba\s+([A-ZÀ-Ý][\wà-ù]*)\s*$/u);
  return match?.[1];
}

const CUISINE_KEYWORDS = [
  'coreano',
  'messicano',
  'thailandese',
  'indiano',
  'cinese',
  'giapponese',
  'peruviano',
  'vietnamita',
  'libanese',
  'greco',
  'turco',
  'spagnolo',
  'argentino',
  'brasiliano',
  'etiope',
];

/** Parole chiave cercate nell'intero testo della riga (nome + tutte le parentesi) per suggerire categorie aggiuntive. */
const KEYWORD_CATEGORY_RULES: Array<{ test: RegExp; category: string }> = [
  { test: /\brooftop\b/, category: 'rooftop' },
  { test: /\bjazz\b|\bmusica\b|\bmusic\b/, category: 'locale_musica' },
  { test: /\blibreria\b/, category: 'libreria_caffe' },
  { test: /\benoteca\b/, category: 'enoteca' },
  { test: /\bhotel\b/, category: 'albergo' },
  { test: /\bgelateria\b|\bgelato\b/, category: 'gelateria' },
  { test: /\bforno\b/, category: 'pasticceria_forno' },
  { test: /\bpizza\b|\bpizzeria\b/, category: 'pizzeria' },
  { test: /\bcocktail\b|\bmixology\b/, category: 'cocktail_bar' },
  { test: /\bstore\b|\bnegozio\b/, category: 'negozio' },
  { test: /\bmuseo\b/, category: 'museo' },
  { test: /\bparco\b/, category: 'parco' },
];

function extractParentheticals(content: string): { name: string; parens: string[] } {
  const parens: string[] = [];
  const name = content
    .replace(/\(([^)]*)\)/g, (_, inner: string) => {
      parens.push(inner.trim());
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
  return { name, parens };
}

/** Estrae il nome della fermata da un inciso tipo "a 8 minuti a piedi dalla fermata metro Ottaviano". */
function extractMetroTag(parenNorm: string, parenOriginal: string): string | undefined {
  const match = parenNorm.match(/\bmetro\s+(.+)$/);
  if (!match) return undefined;
  // ricostruisce la fermata dal testo originale per mantenere le maiuscole leggibili
  const originalMatch = parenOriginal.match(/metro\s+(.+)$/i);
  const station = (originalMatch?.[1] ?? match[1]).trim();
  return `metro ${station}`.toLowerCase();
}

function shortTagFromPhrase(phrase: string): string | undefined {
  const trimmed = phrase.trim();
  if (!trimmed) return undefined;
  const words = trimmed.split(/\s+/).filter(Boolean);
  const withoutLeadingX = words[0]?.toLowerCase() === 'x' ? words.slice(1) : words;
  if (withoutLeadingX.length === 0 || withoutLeadingX.length > 4) return undefined;
  return withoutLeadingX.join(' ').toLowerCase();
}

function parseEntryLine(content: string, defaults: SectionDefaults): ImportDraftRow {
  const { name, parens } = extractParentheticals(content);
  const categories = new Set(defaults.categories);
  const tags = new Set<string>();
  let cuisine: string | undefined;

  const fullTextNorm = normalizeName([name, ...parens].join(' '));
  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.test.test(fullTextNorm)) categories.add(rule.category);
  }

  for (const paren of parens) {
    const parenNorm = normalizeName(paren);

    // hint di cucina etnica: l'intera parentesi è una singola parola nota (es. "(coreano)")
    if (CUISINE_KEYWORDS.includes(parenNorm)) {
      cuisine = paren.trim();
      categories.add('ristorante_etnico');
      continue;
    }

    // hint "anche pranzo/cena/aperitivo" -> categoria aggiuntiva; "brunch" resta un tag libero
    if (/\banche\b/.test(parenNorm)) {
      if (/\bpranzo\b/.test(parenNorm)) categories.add('pranzo');
      if (/\bcena\b/.test(parenNorm)) categories.add('cena');
      if (/\baperitivo\b/.test(parenNorm)) categories.add('aperitivo');
      if (/\bbrunch\b/.test(parenNorm)) tags.add('brunch');
      continue;
    }

    // ogni sotto-frase separata da virgola è trattata singolarmente (metro, tag brevi, ecc.)
    for (const sub of paren.split(',')) {
      const subNorm = normalizeName(sub);
      const metroTag = extractMetroTag(subNorm, sub);
      if (metroTag) {
        tags.add(metroTag);
        continue;
      }
      if (/\bbrunch\b/.test(subNorm)) tags.add('brunch');
      const shortTag = shortTagFromPhrase(sub);
      if (shortTag) tags.add(shortTag);
    }
  }

  return {
    id: newId(),
    rawLine: content,
    name,
    city: '',
    suggestedCategories: Array.from(categories),
    suggestedTags: Array.from(tags),
    notes: parens.join(' · '),
    cuisine,
    geocodeStatus: 'pending',
    decision: 'pending',
  };
}

/**
 * Parsa il formato "a elenco puntato con sezioni" del file di testo originale:
 * intestazioni di sezione senza punto elenco, righe di voce marcate con "◦".
 * È volutamente euristico su categorie e tag: la revisione manuale successiva
 * corregge quello che l'automatismo non indovina.
 */
export function parseImportText(text: string, defaultCity: string): ImportDraftRow[] {
  const lines = text.split(/\r?\n/);
  const rows: ImportDraftRow[] = [];
  let currentDefaults: SectionDefaults = { categories: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith(BULLET)) {
      const content = trimmed.slice(BULLET.length).trim();
      if (!content) continue; // riga puntata vuota (capita nel file originale)
      const row = parseEntryLine(content, currentDefaults);
      row.city = defaultCity;
      rows.push(row);
    } else {
      currentDefaults = sectionDefaultsFor(trimmed);
    }
  }

  return rows;
}
