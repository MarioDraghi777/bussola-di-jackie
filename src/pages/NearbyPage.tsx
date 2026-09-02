import { useState } from 'preact/hooks';
import { geoStatus, position, requestLocation } from '../stores/geoStore';
import { places } from '../stores/placesStore';
import { filters, updateFilters } from '../stores/filtersStore';
import { computeFilteredPlaces } from '../services/filtering';
import { PlaceCard } from '../components/places/PlaceCard';
import { FilterBar } from '../components/filters/FilterBar';

export function NearbyPage() {
  const [showFilters, setShowFilters] = useState(false);
  const status = geoStatus.value;

  const results =
    status === 'ready' && position.value
      ? computeFilteredPlaces(places.value, { ...filters.value, sortBy: 'distanza' }, position.value)
      : [];

  return (
    <div class="page">
      <h1 class="page-title">Vicino a me</h1>

      {status !== 'ready' && (
        <div class="nearby-prompt">
          <p class="hint-text">
            {status === 'denied'
              ? 'Hai negato il permesso di geolocalizzazione: abilitalo nelle impostazioni del browser per usare questa funzione.'
              : status === 'unsupported'
                ? 'Questo dispositivo/browser non supporta la geolocalizzazione.'
                : 'Attiva la posizione per vedere i posti ordinati per distanza reale.'}
          </p>
          <button class="btn btn-primary btn-block" onClick={requestLocation} disabled={status === 'locating'}>
            {status === 'locating' ? 'Localizzazione…' : '📍 Attiva posizione'}
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div class="nearby-controls">
            <button class="btn btn-secondary btn-sm" onClick={requestLocation}>
              🔄 Aggiorna posizione
            </button>
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
