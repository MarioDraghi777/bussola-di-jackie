import { useEffect, useState } from 'preact/hooks';
import {
  formatPositionAge,
  geoStatus,
  position,
  positionAgeSeconds,
  requestLocation,
  startWatching,
} from '../stores/geoStore';
import { places } from '../stores/placesStore';
import { filters, updateFilters } from '../stores/filtersStore';
import { computeFilteredPlaces } from '../services/filtering';
import { PlaceCard } from '../components/places/PlaceCard';
import { FilterBar } from '../components/filters/FilterBar';
import { navigate } from '../router';

export function NearbyPage() {
  const [showFilters, setShowFilters] = useState(false);
  // serve solo a far ridisegnare l'etichetta "aggiornata X fa" mentre il tempo passa
  const [, setTick] = useState(0);

  useEffect(() => {
    const stopWatching = startWatching();
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => {
      stopWatching();
      clearInterval(interval);
    };
  }, []);

  const status = geoStatus.value;
  const current = position.value;
  const ageSeconds = positionAgeSeconds();

  const results = current
    ? computeFilteredPlaces(places.value, { ...filters.value, sortBy: 'distanza' }, current)
    : [];

  return (
    <div class="page">
      <h1 class="page-title">Vicino a me</h1>

      {!current && (
        <div class="nearby-prompt">
          <p class="hint-text">
            {status === 'denied'
              ? 'Hai negato il permesso di geolocalizzazione: abilitalo nelle impostazioni del browser per usare questa funzione.'
              : status === 'unsupported'
                ? 'Questo dispositivo/browser non supporta la geolocalizzazione.'
                : status === 'locating'
                  ? 'Sto cercando il segnale…'
                  : 'Attiva la posizione per vedere i posti ordinati per distanza reale.'}
          </p>
          <button class="btn btn-primary btn-block" onClick={requestLocation} disabled={status === 'locating'}>
            {status === 'locating' ? 'Localizzazione…' : '📍 Attiva posizione'}
          </button>
        </div>
      )}

      {current && (
        <>
          <div class="nearby-status">
            <span class={`gps-dot ${status === 'locating' ? 'searching' : ''}`} aria-hidden="true" />
            <span>
              Posizione aggiornata {formatPositionAge(ageSeconds ?? 0)}
              {current.accuracy > 0 ? ` · precisione ±${Math.round(current.accuracy)} m` : ''}
            </span>
            <button class="btn btn-secondary btn-sm" onClick={requestLocation}>
              🔄
            </button>
          </div>

          <div class="nearby-controls">
            <label class="radius-inline">
              Raggio
              <input
                type="range"
                min="0.2"
                max="20"
                step="0.2"
                value={filters.value.maxDistanceKm ?? 20}
                onInput={(e) => updateFilters({ maxDistanceKm: parseFloat((e.target as HTMLInputElement).value) })}
              />
              <span>{filters.value.maxDistanceKm != null ? `${filters.value.maxDistanceKm} km` : 'illimitato'}</span>
            </label>
            <button class="btn btn-secondary btn-sm" onClick={() => setShowFilters((v) => !v)}>
              Altri filtri
            </button>
          </div>

          {showFilters && <FilterBar />}

          <button class="btn btn-secondary btn-block" onClick={() => navigate('aggiungi')}>
            ➕ Aggiungi un posto qui vicino
          </button>

          {results.length === 0 ? (
            <p class="empty-state">Nessun posto entro il raggio scelto.</p>
          ) : (
            results.map((r) => <PlaceCard key={r.place.id} place={r.place} distanceMeters={r.distanceMeters} />)
          )}
        </>
      )}
    </div>
  );
}
