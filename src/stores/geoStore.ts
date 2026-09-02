import { signal } from '@preact/signals';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export type GeoStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error' | 'unsupported';

export const position = signal<GeoPosition | null>(null);
export const geoStatus = signal<GeoStatus>('idle');

/**
 * Richiede la posizione una tantum (non un watch continuo, per non consumare
 * batteria): la usa sia "Vicino a me" sia il filtro per distanza della ricerca.
 * L'utente può sempre premere di nuovo "aggiorna posizione" per un fix più recente.
 */
export function requestLocation(): void {
  if (!('geolocation' in navigator)) {
    geoStatus.value = 'unsupported';
    return;
  }
  geoStatus.value = 'locating';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      position.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      geoStatus.value = 'ready';
    },
    (err) => {
      geoStatus.value = err.code === err.PERMISSION_DENIED ? 'denied' : 'error';
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
  );
}
