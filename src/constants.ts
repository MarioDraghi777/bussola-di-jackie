import type { PlaceStatus } from './types';

export const STATUS_LABELS: Record<PlaceStatus, string> = {
  da_provare: 'Da provare',
  visitato: 'Visitato',
  scartato: 'Scartato',
};

export const STATUS_ORDER: PlaceStatus[] = ['da_provare', 'visitato', 'scartato'];
