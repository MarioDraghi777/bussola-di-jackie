import { useState } from 'preact/hooks';
import type { Place, PlaceStatus } from '../../types';
import { STATUS_LABELS, STATUS_ORDER } from '../../constants';
import { CategoryPicker } from './CategoryPicker';
import { TagEditor } from './TagEditor';
import { StarRating } from './StarRating';
import { ManualPinPicker } from './ManualPinPicker';

export function PlaceForm(props: { place: Place; onSave: (changes: Partial<Place>) => void }) {
  const { place } = props;
  const [draft, setDraft] = useState<Place>(place);
  const [editingLocation, setEditingLocation] = useState(false);

  function set<K extends keyof Place>(key: K, value: Place[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function toggleCategory(id: string) {
    set('categories', draft.categories.includes(id) ? draft.categories.filter((c) => c !== id) : [...draft.categories, id]);
  }

  const isEtnico = draft.categories.includes('ristorante_etnico');

  return (
    <div>
      <div class="field">
        <label for="edit-name">Nome</label>
        <input id="edit-name" class="input" value={draft.name} onInput={(e) => set('name', (e.target as HTMLInputElement).value)} />
      </div>

      <div class="field">
        <label for="edit-city">Città</label>
        <input id="edit-city" class="input" value={draft.city} onInput={(e) => set('city', (e.target as HTMLInputElement).value)} />
      </div>

      <div class="field">
        <label>Posizione</label>
        <div class="location-row">
          <span>
            {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
          </span>
          <button type="button" class="btn btn-secondary btn-sm" onClick={() => setEditingLocation(true)}>
            Modifica pin
          </button>
        </div>
        {draft.address && <p class="hint-text">{draft.address}</p>}
      </div>

      <div class="field">
        <label>Categorie</label>
        <CategoryPicker selected={draft.categories} onToggle={toggleCategory} />
      </div>

      {isEtnico && (
        <div class="field">
          <label for="edit-cuisine">Tipo di cucina</label>
          <input
            id="edit-cuisine"
            class="input"
            placeholder="Es. coreano, messicano…"
            value={draft.cuisine ?? ''}
            onInput={(e) => set('cuisine', (e.target as HTMLInputElement).value)}
          />
        </div>
      )}

      <div class="field">
        <label>Tag</label>
        <TagEditor tags={draft.tags} onChange={(tags) => set('tags', tags)} />
      </div>

      <div class="field">
        <label>Stato</label>
        <div class="chip-picker">
          {STATUS_ORDER.map((s: PlaceStatus) => (
            <button
              key={s}
              type="button"
              class={`chip-picker-item ${draft.status === s ? 'selected' : ''}`}
              onClick={() => set('status', s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {draft.status === 'visitato' && (
        <>
          <div class="field">
            <label>Voto</label>
            <StarRating value={draft.visitRating} onChange={(v) => set('visitRating', v)} />
          </div>
          <div class="field">
            <label for="edit-visit-date">Data della visita</label>
            <input
              id="edit-visit-date"
              type="date"
              class="input"
              value={draft.visitDate ?? ''}
              onInput={(e) => set('visitDate', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="field">
            <label for="edit-visit-note">Nota sulla visita</label>
            <textarea
              id="edit-visit-note"
              class="input"
              rows={3}
              value={draft.visitNote ?? ''}
              onInput={(e) => set('visitNote', (e.target as HTMLTextAreaElement).value)}
            />
          </div>
        </>
      )}

      <div class="field">
        <label for="edit-notes">Note</label>
        <textarea
          id="edit-notes"
          class="input"
          rows={3}
          value={draft.notes}
          onInput={(e) => set('notes', (e.target as HTMLTextAreaElement).value)}
        />
      </div>

      <button type="button" class="btn btn-primary btn-block" onClick={() => props.onSave(draft)}>
        Salva modifiche
      </button>

      {editingLocation && (
        <ManualPinPicker
          initialCenter={[draft.lng, draft.lat]}
          onConfirm={(coords, label) => {
            setDraft((d) => ({ ...d, lat: coords.lat, lng: coords.lng, geocodeSource: 'manual_pin', address: label ?? d.address }));
            setEditingLocation(false);
          }}
          onClose={() => setEditingLocation(false)}
        />
      )}
    </div>
  );
}
