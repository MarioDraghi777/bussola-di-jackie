import { useEffect, useState } from 'preact/hooks';
import { Sheet } from '../layout/Sheet';
import { resolveMapsShare, type LatLng, type MapsShareResult } from '../../services/geocoding';

interface Props {
  city?: string;
  near?: LatLng | null;
  /** testo già pronto (es. arrivato dalla condivisione di sistema): risolve da solo all'apertura */
  initialText?: string;
  onConfirm: (coords: LatLng, label?: string) => void;
  onClose: () => void;
}

type Phase = { kind: 'input' } | { kind: 'resolving' } | { kind: 'result'; result: MapsShareResult };

export function MapsShareSheet(props: Props) {
  const [value, setValue] = useState(props.initialText ?? '');
  const [phase, setPhase] = useState<Phase>({ kind: 'input' });

  async function resolve(text: string) {
    setPhase({ kind: 'resolving' });
    const result = await resolveMapsShare(text, props.city ?? '', props.near ?? null);
    setPhase({ kind: 'result', result });
  }

  useEffect(() => {
    if (props.initialText?.trim()) void resolve(props.initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Sheet title="Da Google Maps" onClose={props.onClose}>
      {phase.kind === 'input' && (
        <>
          <p class="hint-text">
            In Google Maps tocca <strong>Condividi</strong> e incolla qui quello che copi: va bene sia il link breve
            (maps.app.goo.gl) sia il messaggio completo con nome e indirizzo.
          </p>
          <textarea
            class="input"
            rows={4}
            placeholder={'Bar della Cometa\nVia dei Coronari 12, Roma\nhttps://maps.app.goo.gl/…'}
            value={value}
            onInput={(e) => setValue((e.target as HTMLTextAreaElement).value)}
          />
          <button class="btn btn-primary btn-block" disabled={!value.trim()} onClick={() => resolve(value)}>
            Trova la posizione
          </button>
        </>
      )}

      {phase.kind === 'resolving' && <p class="hint-text">Sto cercando la posizione…</p>}

      {phase.kind === 'result' && phase.result.kind === 'coords' && (
        <>
          <p class="hint-text">
            {phase.result.via === 'link_espanso' ? 'Link espanso.' : 'Coordinate lette dal link.'}
            {phase.result.label ? ` Posto: ${phase.result.label}.` : ''}
          </p>
          <p class="pin-label">
            {phase.result.lat.toFixed(5)}, {phase.result.lng.toFixed(5)}
          </p>
          <button
            class="btn btn-primary btn-block"
            onClick={() => {
              const { lat, lng, label } = phase.result as Extract<MapsShareResult, { kind: 'coords' }>;
              props.onConfirm({ lat, lng }, label);
            }}
          >
            Usa questa posizione
          </button>
          <button class="btn btn-secondary btn-block" onClick={() => setPhase({ kind: 'input' })}>
            Riprova con un altro testo
          </button>
        </>
      )}

      {phase.kind === 'result' && phase.result.kind === 'candidates' && (
        <>
          <p class="hint-text">
            Il link breve non era espandibile, ma dal testo condiviso ho trovato questi posti: scegli quello giusto.
          </p>
          <div class="candidate-list">
            {phase.result.candidates.map((c, i) => (
              <button
                key={i}
                class="candidate-item"
                onClick={() => props.onConfirm({ lat: c.lat, lng: c.lng }, c.displayName)}
              >
                <span class="candidate-name">{c.displayName}</span>
                <span class="candidate-coords">
                  {c.lat.toFixed(5)}, {c.lng.toFixed(5)}
                </span>
              </button>
            ))}
          </div>
          <button class="btn btn-secondary btn-block" onClick={() => setPhase({ kind: 'input' })}>
            Nessuno di questi
          </button>
        </>
      )}

      {phase.kind === 'result' && phase.result.kind === 'failed' && (
        <>
          <p class="error-text">
            Non sono riuscito a ricavare la posizione da questo testo. Se hai incollato solo il link breve, prova a
            condividere il messaggio completo (di solito contiene anche nome e indirizzo del posto), oppure chiudi qui e
            usa "Posiziona il pin sulla mappa".
          </p>
          <button class="btn btn-secondary btn-block" onClick={() => setPhase({ kind: 'input' })}>
            Riprova
          </button>
        </>
      )}
    </Sheet>
  );
}
