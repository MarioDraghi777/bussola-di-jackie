import type { ComponentChildren } from 'preact';

/** Foglio modale che sale dal basso: pattern mobile standard per scelte/conferme. */
export function Sheet(props: { title: string; onClose: () => void; children: ComponentChildren }) {
  return (
    <div class="sheet-backdrop" onClick={props.onClose}>
      <div class="sheet" onClick={(e) => e.stopPropagation()}>
        <div class="sheet-header">
          <h2 class="sheet-title">{props.title}</h2>
          <button class="sheet-close" onClick={props.onClose} aria-label="Chiudi">
            ✕
          </button>
        </div>
        <div class="sheet-body">{props.children}</div>
      </div>
    </div>
  );
}
