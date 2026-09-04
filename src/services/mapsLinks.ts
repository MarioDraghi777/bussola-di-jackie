/**
 * Parsing puro di link e testi condivisi da Google Maps.
 * Niente rete e niente database qui dentro: così è testabile da solo.
 */

export interface ParsedMapsLink {
  lat: number;
  lng: number;
}

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0) // 0,0 è quasi sempre un falso positivo, non l'oceano al largo del Ghana
  );
}

function pick(lat: number, lng: number): ParsedMapsLink | null {
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
}

/**
 * Estrae lat/lng da un URL Google Maps "esteso" (anche dentro un testo più lungo,
 * anche se è l'URL di consenso `consent.google.com?continue=...`).
 * I pattern sono provati dal più preciso (il marker del posto) al meno preciso
 * (il centro della mappa inquadrata).
 */
export function parseGoogleMapsLink(rawUrl: string): ParsedMapsLink | null {
  let url = rawUrl.trim();
  // i link di consenso contengono l'URL vero percent-encoded nel parametro continue
  try {
    url = decodeURIComponent(url);
  } catch {
    // sequenze percent malformate: si continua con la stringa originale
  }

  // coordinate del marker specifico: le più affidabili
  const marker = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (marker) {
    const found = pick(parseFloat(marker[1]), parseFloat(marker[2]));
    if (found) return found;
  }

  // coordinate passate esplicitamente come parametro
  const paramPatterns = [
    /[?&]q=(?:loc:)?(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]center=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /[?&]destination=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
    /\/search\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
  ];
  for (const pattern of paramPatterns) {
    const match = url.match(pattern);
    if (match) {
      const found = pick(parseFloat(match[1]), parseFloat(match[2]));
      if (found) return found;
    }
  }

  // centro del viewport: meno preciso, usato solo se non c'è altro
  const viewport = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (viewport) {
    const found = pick(parseFloat(viewport[1]), parseFloat(viewport[2]));
    if (found) return found;
  }

  return null;
}

export function isShortenedMapsLink(rawUrl: string): boolean {
  return /goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs/i.test(rawUrl);
}

export function isMapsLink(rawUrl: string): boolean {
  return /google\.[a-z.]+\/maps|maps\.google|goo\.gl|maps\.app/i.test(rawUrl);
}

/** Primo URL contenuto in un testo qualunque (il messaggio di condivisione ne ha uno solo). */
export function extractFirstUrl(text: string): string | null {
  return text.match(/https?:\/\/[^\s<>"')]+/i)?.[0] ?? null;
}

/**
 * Dal testo condiviso da Google Maps ricava una query geocodificabile.
 * Il formato tipico è "Nome del posto\nVia Tal dei Tali, Roma\nhttps://maps.app.goo.gl/…":
 * togliendo l'URL restano proprio nome e indirizzo, che è quello che serve a Nominatim.
 */
export function shareTextToQuery(text: string): string {
  const withoutUrl = text.replace(/https?:\/\/\S+/gi, ' ');
  const lines = withoutUrl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(vieni a vedere|dai un'occhiata|check out|guarda)/i.test(line));
  return lines.slice(0, 2).join(', ').replace(/\s+/g, ' ').trim();
}

/** Nome del posto dall'URL esteso (…/maps/place/Bar+Della+Cometa/…), se presente. */
export function placeNameFromMapsUrl(url: string): string | undefined {
  const match = url.match(/\/maps\/place\/([^/@?]+)/);
  if (!match) return undefined;
  try {
    const decoded = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
    return decoded && !/^-?\d+(\.\d+)?,/.test(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}
