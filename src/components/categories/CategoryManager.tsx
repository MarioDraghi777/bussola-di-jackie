import { useState } from 'preact/hooks';
import {
  categories as categoriesSignal,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../stores/categoriesStore';

const DEFAULT_NEW_COLOR = '#2a78d6';

/** Colore libero: input nativo <input type="color">, l'utente sceglie esattamente il colore che vuole. */
function ColorPicker(props: { value: string; onChange: (color: string) => void }) {
  return (
    <input
      type="color"
      class="color-swatch-input"
      value={props.value}
      onInput={(e) => props.onChange((e.target as HTMLInputElement).value)}
      aria-label="Colore categoria"
    />
  );
}

export function CategoryManager() {
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏷️');
  const [newColor, setNewColor] = useState(DEFAULT_NEW_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    await addCategory(newLabel.trim(), newEmoji.trim() || '🏷️', newColor);
    setNewLabel('');
    setNewEmoji('🏷️');
    setNewColor(DEFAULT_NEW_COLOR);
  }

  return (
    <div>
      <div class="category-manager-list">
        {categoriesSignal.value.map((c) => (
          <div key={c.id} class="category-manager-row">
            {editingId === c.id ? (
              <>
                <input
                  class="input category-edit-emoji"
                  value={c.emoji}
                  onInput={(e) => updateCategory(c.id, { emoji: (e.target as HTMLInputElement).value })}
                />
                <input
                  class="input"
                  value={c.label}
                  onInput={(e) => updateCategory(c.id, { label: (e.target as HTMLInputElement).value })}
                />
                <ColorPicker value={c.color} onChange={(color) => updateCategory(c.id, { color })} />
                <button class="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                  Fatto
                </button>
              </>
            ) : (
              <>
                <span class="category-manager-label">
                  <span class="map-legend-dot" style={{ background: c.color }} /> {c.emoji} {c.label}
                </span>
                <button class="btn btn-secondary btn-sm" onClick={() => setEditingId(c.id)}>
                  Modifica
                </button>
                {!c.builtIn && (
                  <button class="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>
                    Elimina
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div class="category-add-form">
        <p class="field-label-standalone">Nuova categoria</p>
        <div class="category-add-row">
          <input class="input category-edit-emoji" value={newEmoji} onInput={(e) => setNewEmoji((e.target as HTMLInputElement).value)} />
          <input
            class="input"
            placeholder="Nome categoria"
            value={newLabel}
            onInput={(e) => setNewLabel((e.target as HTMLInputElement).value)}
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
        </div>
        <button class="btn btn-primary btn-block" disabled={!newLabel.trim()} onClick={handleAdd}>
          Aggiungi categoria
        </button>
      </div>
    </div>
  );
}
