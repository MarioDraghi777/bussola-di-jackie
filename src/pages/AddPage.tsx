import { useState } from 'preact/hooks';
import { newId } from '../utils/id';
import { getLastCity, setLastCity } from '../utils/preferences';
import { searchPlace } from '../services/geocoding';
import { findPossibleDuplicates, type DuplicateMatch } from '../services/duplicates';
import { addPlace, places } from '../stores/placesStore';
import { navigate } from '../router';
import type { GeocodeCandidate, GeocodeSource, Place } from '../types';
import { GeocodeCandidatesModal } from '../components/places/GeocodeCandidatesModal';
import { ManualPinPicker } from '../components/places/ManualPinPicker';
import { GmapsLinkSheet } from '../components/places/GmapsLinkSheet';
import { DuplicateWarning } from '../components/places/DuplicateWarning';

interface ResolvedLocation {
  lat: number;
  lng: number;
  source: GeocodeSource;
  address?: string;
}

type Stage =
  | { kind: 'form' }
  | { kind: 'searching' }
  | { kind: 'candidates'; candidates: GeocodeCandidate[] }
  | { kind: 'not_found' }
  | { kind: 'manual_pin' }
  | { kind: 'gmaps_link' }
  | { kind: 'confirm_duplicate'; resolved: ResolvedLocation; matches: DuplicateMatch[] };

export function AddPage() {
  const [name, setName] = useState('');
  const [city, setCity] = useState(getLastCity());
  const [stage, setStage] = useState<Stage>({ kind: 'form' });
  const [nameDuplicates, setNameDuplicates] = useState<DuplicateMatch[]>([]);

  function onNameInput(value: string) {
    setName(value);
    setNameDuplicates(value.trim().length > 2 ? findPossibleDuplicates({ name: value }, places.value) : []);
  }

  async function commitPlace(resolved: ResolvedLocation) {
    const now = Date.now();
    const place: Place = {
      id: newId(),
      name: name.trim(),
      city: city.trim() || 'Roma',
      categories: [],
      tags: [],
      status: 'da_provare',
      lat: resolved.lat,
      lng: resolved.lng,
      geocodeSource: resolved.source,
      address: resolved.address,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    setLastCity(place.city);
    await addPlace(place);
    navigate('posto', place.id);
  }

  /** Punto unico dopo cui abbiamo delle coordinate: qui si controllano i duplicati per nome+posizione. */
  function resolveLocation(lat: number, lng: number, source: GeocodeSource, address?: string) {
    const resolved: ResolvedLocation = { lat, lng, source, address };
    const matches = findPossibleDuplicates({ name: name.trim(), lat, lng }, places.value);
    if (matches.length > 0) {
      setStage({ kind: 'confirm_duplicate', resolved, matches });
    } else {
      void commitPlace(resolved);
    }
  }

  async function handleSave() {
    if (!name.trim()) return;
    setStage({ kind: 'searching' });
    const results = await searchPlace(name.trim(), city.trim());
    if (results.length === 0) {
      setStage({ kind: 'not_found' });
    } else if (results.length === 1) {
      resolveLocation(results[0].lat, results[0].lng, 'nominatim', results[0].displayName);
    } else {
      setStage({ kind: 'candidates', candidates: results });
    }
  }

  return (
    <div class="page">
      <h1 class="page-title">Aggiungi un posto</h1>

      <div class="field">
        <label for="add-name">Nome</label>
        <input
          id="add-name"
          class="input"
          value={name}
          onInput={(e) => onNameInput((e.target as HTMLInputElement).value)}
          placeholder="Es. Retrobottega"
          autoFocus
        />
      </div>
      <DuplicateWarning matches={nameDuplicates} />

      <div class="field">
        <label for="add-city">Città</label>
        <input id="add-city" class="input" value={city} onInput={(e) => setCity((e.target as HTMLInputElement).value)} />
      </div>

      <button class="btn btn-primary btn-block" disabled={!name.trim() || stage.kind === 'searching'} onClick={handleSave}>
        {stage.kind === 'searching' ? 'Cerco le coordinate…' : 'Salva'}
      </button>

      {stage.kind === 'not_found' && (
        <div class="not-found-box">
          <p>Non ho trovato "{name}" su {city}. Nessun problema, si può fissare subito:</p>
          <button class="btn btn-secondary btn-block" onClick={() => setStage({ kind: 'manual_pin' })}>
            📍 Posiziona il pin sulla mappa
          </button>
          <button class="btn btn-secondary btn-block" onClick={() => setStage({ kind: 'gmaps_link' })}>
            🔗 Incolla un link Google Maps
          </button>
        </div>
      )}

      {stage.kind === 'candidates' && (
        <GeocodeCandidatesModal
          candidates={stage.candidates}
          onChoose={(c) => resolveLocation(c.lat, c.lng, 'nominatim', c.displayName)}
          onManual={() => setStage({ kind: 'manual_pin' })}
          onClose={() => setStage({ kind: 'form' })}
        />
      )}

      {stage.kind === 'manual_pin' && (
        <ManualPinPicker
          onConfirm={(coords, label) => resolveLocation(coords.lat, coords.lng, 'manual_pin', label)}
          onClose={() => setStage({ kind: 'form' })}
        />
      )}

      {stage.kind === 'gmaps_link' && (
        <GmapsLinkSheet
          onConfirm={(coords) => resolveLocation(coords.lat, coords.lng, 'gmaps_link')}
          onClose={() => setStage({ kind: 'form' })}
        />
      )}

      {stage.kind === 'confirm_duplicate' && (
        <div class="not-found-box">
          <DuplicateWarning matches={stage.matches} />
          <button class="btn btn-primary btn-block" onClick={() => commitPlace(stage.resolved)}>
            Salva comunque come posto nuovo
          </button>
          <button class="btn btn-secondary btn-block" onClick={() => navigate('posto', stage.matches[0].place.id)}>
            Vedi il posto esistente invece
          </button>
          <button class="btn btn-secondary btn-block" onClick={() => setStage({ kind: 'form' })}>
            Annulla
          </button>
        </div>
      )}
    </div>
  );
}
