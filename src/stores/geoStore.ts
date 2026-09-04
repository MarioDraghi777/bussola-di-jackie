import { signal } from '@preact/signals';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  /** quando è stato preso il fix (ms epoch): serve a dire all'utente quanto è fresca la posizione */
  timestamp: number;
}

export type GeoStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error' | 'unsupported';

export const position = signal<GeoPosition | null>(null);
export const geoStatus = signal<GeoStatus>('idle');

const OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 20000,
  // niente cache: un fix vecchio mentre cammini è peggio di nessun fix
  maximumAge: 0,
};

function onSuccess(pos: GeolocationPosition): void {
  position.value = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    timestamp: pos.timestamp,
  };
  geoStatus.value = 'ready';
}

function onError(err: GeolocationPositionError): void {
  if (err.code === err.PERMISSION_DENIED) {
    geoStatus.value = 'denied';
    return;
  }
  // timeout o posizione momentaneamente non disponibile: se un fix ce l'abbiamo già
  // lo teniamo buono invece di far sparire la lista
  geoStatus.value = position.value ? 'ready' : 'error';
}

let watchId: number | null = null;
let subscribers = 0;

/**
 * Avvia il tracciamento continuo della posizione mentre una schermata che ne ha
 * bisogno è aperta, e lo ferma quando l'ultima si chiude (contatore di
 * sottoscrittori): così le distanze si aggiornano mentre cammini, senza tenere
 * il GPS acceso quando sei su altre schermate.
 * Ritorna la funzione per disiscriversi.
 */
export function startWatching(): () => void {
  if (!('geolocation' in navigator)) {
    geoStatus.value = 'unsupported';
    return () => {};
  }

  subscribers++;
  if (watchId === null) {
    if (geoStatus.value !== 'ready') geoStatus.value = 'locating';
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, OPTIONS);
  }

  return () => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0 && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };
}

/** Richiesta una tantum, per chi vuole un fix senza restare in ascolto (filtro distanza, bias di ricerca). */
export function requestLocation(): void {
  if (!('geolocation' in navigator)) {
    geoStatus.value = 'unsupported';
    return;
  }
  if (geoStatus.value !== 'ready') geoStatus.value = 'locating';
  navigator.geolocation.getCurrentPosition(onSuccess, onError, OPTIONS);
}

/** Secondi trascorsi dall'ultimo fix, o null se non ne abbiamo ancora uno. */
export function positionAgeSeconds(): number | null {
  if (!position.value) return null;
  return Math.max(0, Math.round((Date.now() - position.value.timestamp) / 1000));
}

export function formatPositionAge(seconds: number): string {
  if (seconds < 5) return 'adesso';
  if (seconds < 60) return `${seconds} s fa`;
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} min fa` : `${Math.round(minutes / 60)} h fa`;
}
