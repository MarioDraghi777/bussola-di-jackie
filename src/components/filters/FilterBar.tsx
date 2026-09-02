import { useEffect, useState } from 'preact/hooks';
import { categories as categoriesSignal } from '../../stores/categoriesStore';
import { distinctCities, distinctTags } from '../../db/places';
import { filters, updateFilters, resetFilters } from '../../stores/filtersStore';
import { geoStatus, requestLocation } from '../../stores/geoStore';
import { STATUS_LABELS, STATUS_ORDER } from '../../constants';
import type { PlaceStatus } from '../../types';

export function FilterBar() {
  const [expanded, setExpanded] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const f = filters.value;

  useEffect(() => {
    distinctCities().then(setCities);
    distinctTags().then(setAllTags);
  }, []);

  function toggleInArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  const activeCount =
    (f.text ? 1 : 0) + f.categories.length + f.tags.length + f.statuses.length + (f.city ? 1 : 0) + (f.maxDistanceKm != null ? 1 : 0);

  return (
    <div class="filter-bar">
      <div class="filter-search-row">
        <input
          class="input"
          placeholder="Cerca per nome, nota, tag…"
          value={f.text}
          onInput={(e) => updateFilters({ text: (e.target as HTMLInputElement).value })}
        />
        <button class="btn btn-secondary btn-sm" onClick={() => setExpanded((v) => !v)}>
          Filtri{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {expanded && (
        <div class="filter-panel">
          <div class="field">
            <label>Categoria</label>
            <div class="chip-picker">
              {categoriesSignal.value.map((c) => (
                <button
                  key={c.id}
                  class={`chip-picker-item ${f.categories.includes(c.id) ? 'selected' : ''}`}
                  style={{ '--chip-color': `var(--fam-${c.colorFamily})` }}
                  onClick={() => updateFilters({ categories: toggleInArray(f.categories, c.id) })}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div class="field">
            <label>Stato</label>
            <div class="chip-picker">
              {STATUS_ORDER.map((s: PlaceStatus) => (
                <button
                  key={s}
                  class={`chip-picker-item ${f.statuses.includes(s) ? 'selected' : ''}`}
                  onClick={() => updateFilters({ statuses: toggleInArray(f.statuses, s) })}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {allTags.length > 0 && (
            <div class="field">
              <label>Tag</label>
              <div class="chip-picker">
                {allTags.map((t) => (
                  <button
                    key={t}
                    class={`chip-picker-item ${f.tags.includes(t) ? 'selected' : ''}`}
                    onClick={() => updateFilters({ tags: toggleInArray(f.tags, t) })}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div class="field">
            <label for="filter-city">Città</label>
            <select
              id="filter-city"
              class="select"
              value={f.city}
              onChange={(e) => updateFilters({ city: (e.target as HTMLSelectElement).value })}
            >
              <option value="">Tutte</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div class="field">
            <label>Distanza</label>
            {geoStatus.value !== 'ready' ? (
              <button class="btn btn-secondary btn-sm" onClick={requestLocation}>
                📍 Attiva posizione per filtrare per distanza
              </button>
            ) : (
              <div class="distance-filter-row">
                <input
                  type="range"
                  min="0.2"
                  max="20"
                  step="0.2"
                  value={f.maxDistanceKm ?? 20}
                  onInput={(e) => updateFilters({ maxDistanceKm: parseFloat((e.target as HTMLInputElement).value) })}
                />
                <span>{f.maxDistanceKm != null ? `entro ${f.maxDistanceKm} km` : 'nessun limite'}</span>
                {f.maxDistanceKm != null && (
                  <button class="btn btn-secondary btn-sm" onClick={() => updateFilters({ maxDistanceKm: null })}>
                    Rimuovi
                  </button>
                )}
              </div>
            )}
          </div>

          <div class="field">
            <label for="filter-sort">Ordina per</label>
            <select
              id="filter-sort"
              class="select"
              value={f.sortBy}
              onChange={(e) => updateFilters({ sortBy: (e.target as HTMLSelectElement).value as typeof f.sortBy })}
            >
              <option value="nome">Nome</option>
              <option value="distanza">Distanza</option>
              <option value="aggiornamento">Ultimo aggiornamento</option>
            </select>
          </div>

          <button class="btn btn-secondary btn-block" onClick={resetFilters}>
            Azzera filtri
          </button>
        </div>
      )}
    </div>
  );
}
