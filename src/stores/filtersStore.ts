import { computed, signal } from '@preact/signals';
import { computeFilteredPlaces, DEFAULT_FILTERS, type FilterState } from '../services/filtering';
import { places } from './placesStore';
import { position } from './geoStore';

export const filters = signal<FilterState>({ ...DEFAULT_FILTERS });

export const filteredPlaces = computed(() => computeFilteredPlaces(places.value, filters.value, position.value));

export function resetFilters(): void {
  filters.value = { ...DEFAULT_FILTERS };
}

export function updateFilters(changes: Partial<FilterState>): void {
  filters.value = { ...filters.value, ...changes };
}
