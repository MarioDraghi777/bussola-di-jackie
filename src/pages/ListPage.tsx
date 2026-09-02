import { filteredPlaces } from '../stores/filtersStore';
import { places } from '../stores/placesStore';
import { FilterBar } from '../components/filters/FilterBar';
import { PlaceCard } from '../components/places/PlaceCard';

export function ListPage() {
  const results = filteredPlaces.value;

  return (
    <div class="page">
      <h1 class="page-title">I tuoi posti ({places.value.length})</h1>
      <FilterBar />
      {results.length === 0 ? (
        <p class="empty-state">Nessun posto corrisponde ai filtri.</p>
      ) : (
        results.map((r) => <PlaceCard key={r.place.id} place={r.place} distanceMeters={r.distanceMeters} />)
      )}
    </div>
  );
}
