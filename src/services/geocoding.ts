import { db } from '../db/schema';
import type { GeocodeCandidate } from '../types';

/**
 * Client per Nominatim (geocoder di OpenStreetMap), l'unico gratuito senza API key.
 * La sua usage policy (https://operations.osmfoundation.org/policies/nominatim/)
 * impone: max 1 richiesta/secondo, identificazione del client, cache dei risultati.
 * Dal browser non si può impostare uno User-Agent custom (i fetch lo bloccano per
 * sicurezza): l'identificazione avviene tramite il Referer che il browser invia
 * automaticamente con l'origine dell'app, per questo non va disattivato altrove.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const MIN_INTERVAL_MS = 1100; // poco sopra 1 richiesta/secondo, con margine

let queue: Promise<unknown> = Promise.resolve();
let lastDispatchAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Accoda una chiamata rispettando lo spacing minimo, indipendentemente da errori precedenti. */
function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastDispatchAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastDispatchAt = Date.now();
    return fn();
  });
  queue = run.catch(() => undefined);
  return run;
}

function normalizeQuery(name: string, city: string): string {
  return `${name}|${city}`.trim().toLowerCase().replace(/\s+/g, ' ');
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance?: number;
}

async function fetchFromCache(key: string): Promise<GeocodeCandidate[] | undefined> {
  const entry = await db.geocodeCache.get(key);
  return entry?.results;
}

async function saveToCache(key: string, results: GeocodeCandidate[]): Promise<void> {
  await db.geocodeCache.put({ query: key, results, timestamp: Date.now() });
}

/**
 * Cerca un posto per nome (+ città opzionale). Ritorna tutti i candidati trovati:
 * se sono più di uno è compito della UI farli scegliere all'utente.
 * Non lancia mai eccezioni per "nessun risultato": ritorna semplicemente [].
 */
export async function searchPlace(name: string, city = ''): Promise<GeocodeCandidate[]> {
  const key = normalizeQuery(name, city);
  const cached = await fetchFromCache(key);
  if (cached) return cached;

  const query = city ? `${name}, ${city}` : name;
  const url = `${NOMINATIM_BASE}/search?format=jsonv2&addressdetails=0&limit=5&q=${encodeURIComponent(query)}`;

  const results = await throttled(async () => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Nominatim ha risposto ${res.status}`);
    const data = (await res.json()) as NominatimResult[];
    return data.map(
      (r): GeocodeCandidate => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        displayName: r.display_name,
        importance: r.importance ?? 0,
      }),
    );
  }).catch(() => [] as GeocodeCandidate[]); // fallimento di rete: nessun candidato, mai un posto "inventato"

  await saveToCache(key, results);
  return results;
}

/** Reverse geocoding best-effort: usato solo per mostrare un'etichetta leggibile su un pin manuale. */
export async function reverseGeocode(lat: number, lng: number): Promise<string | undefined> {
  const key = `rev|${lat.toFixed(5)}|${lng.toFixed(5)}`;
  const cached = await fetchFromCache(key);
  if (cached?.[0]) return cached[0].displayName;

  const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`;
  const result = await throttled(async () => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Nominatim ha risposto ${res.status}`);
    const data = (await res.json()) as NominatimResult;
    return data.display_name;
  }).catch(() => undefined);

  if (result) {
    await saveToCache(key, [{ lat, lng, displayName: result, importance: 0 }]);
  }
  return result;
}

export interface ParsedMapsLink {
  lat: number;
  lng: number;
}

/**
 * Estrae lat/lng da un link Google Maps "esteso" (non abbreviato).
 * I link abbreviati (maps.app.goo.gl, goo.gl/maps) non sono risolvibili lato
 * client per via del redirect opaco CORS: in quel caso ritorna null e la UI
 * spiega all'utente come espanderlo prima di incollarlo.
 */
export function parseGoogleMapsLink(rawUrl: string): ParsedMapsLink | null {
  const url = rawUrl.trim();

  // coordinate del marker specifico, più precise del centro mappa
  const markerMatch = url.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (markerMatch) {
    return { lat: parseFloat(markerMatch[1]), lng: parseFloat(markerMatch[2]) };
  }

  const queryMatch = url.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (queryMatch) {
    return { lat: parseFloat(queryMatch[1]), lng: parseFloat(queryMatch[2]) };
  }

  const llMatch = url.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (llMatch) {
    return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
  }

  // centro del viewport: fallback meno preciso, usato solo se non c'è altro
  const viewportMatch = url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (viewportMatch) {
    return { lat: parseFloat(viewportMatch[1]), lng: parseFloat(viewportMatch[2]) };
  }

  return null;
}

export function isShortenedMapsLink(rawUrl: string): boolean {
  return /goo\.gl\/maps|maps\.app\.goo\.gl/i.test(rawUrl);
}
