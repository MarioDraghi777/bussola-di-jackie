const LAST_CITY_KEY = 'bussola:last-city';

/** Preferenza leggera solo-UI: non è un dato di dominio, va bene localStorage. */
export function getLastCity(): string {
  try {
    return localStorage.getItem(LAST_CITY_KEY) || 'Roma';
  } catch {
    return 'Roma';
  }
}

export function setLastCity(city: string): void {
  try {
    localStorage.setItem(LAST_CITY_KEY, city);
  } catch {
    // storage non disponibile (modalità privata, ecc.): non blocca l'app
  }
}
