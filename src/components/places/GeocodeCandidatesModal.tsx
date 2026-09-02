import type { GeocodeCandidate } from '../../types';
import { Sheet } from '../layout/Sheet';

export function GeocodeCandidatesModal(props: {
  candidates: GeocodeCandidate[];
  onChoose: (candidate: GeocodeCandidate) => void;
  onManual: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="Quale di questi?" onClose={props.onClose}>
      <p class="hint-text">Il geocoder ha trovato più risultati: scegli quello giusto.</p>
      <div class="candidate-list">
        {props.candidates.map((c, i) => (
          <button key={i} class="candidate-item" onClick={() => props.onChoose(c)}>
            <span class="candidate-name">{c.displayName}</span>
            <span class="candidate-coords">
              {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
            </span>
          </button>
        ))}
      </div>
      <button class="btn btn-secondary btn-block" onClick={props.onManual}>
        Nessuno di questi: posiziona il pin a mano
      </button>
    </Sheet>
  );
}
