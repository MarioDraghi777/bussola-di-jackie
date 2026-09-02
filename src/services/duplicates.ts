import type { Place } from '../types';
import { haversineDistanceMeters } from './distance';
import { normalizeName, similarityRatio } from './textSimilarity';

const NAME_SIMILARITY_THRESHOLD = 0.82;
const PROXIMITY_METERS_THRESHOLD = 60; // ~ stesso isolato/edificio

export interface DuplicateMatch {
  place: Place;
  reason: 'nome' | 'posizione' | 'nome e posizione';
  score: number;
}

/**
 * Cerca possibili duplicati di un nuovo posto (nome simile o coordinate vicine)
 * fra quelli già salvati. Usato sia nella scheda di aggiunta rapida sia nella
 * revisione dell'import in blocco: in entrambi i casi è solo un avviso,
 * l'utente decide se è davvero un doppione o un posto diverso.
 */
export function findPossibleDuplicates(
  candidate: { name: string; lat?: number; lng?: number },
  existing: Place[],
): DuplicateMatch[] {
  const normCandidate = normalizeName(candidate.name);
  const matches: DuplicateMatch[] = [];

  for (const place of existing) {
    const nameScore = similarityRatio(normCandidate, normalizeName(place.name));
    const nameMatch = nameScore >= NAME_SIMILARITY_THRESHOLD;

    let locationMatch = false;
    let distance = Infinity;
    if (candidate.lat != null && candidate.lng != null) {
      distance = haversineDistanceMeters({ lat: candidate.lat, lng: candidate.lng }, place);
      locationMatch = distance <= PROXIMITY_METERS_THRESHOLD;
    }

    if (nameMatch && locationMatch) {
      matches.push({ place, reason: 'nome e posizione', score: nameScore });
    } else if (nameMatch) {
      matches.push({ place, reason: 'nome', score: nameScore });
    } else if (locationMatch) {
      matches.push({ place, reason: 'posizione', score: 1 - distance / PROXIMITY_METERS_THRESHOLD });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}
