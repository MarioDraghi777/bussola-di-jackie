import { useState } from 'preact/hooks';
import type { ColorFamily } from '../../types';
import {
  categories as categoriesSignal,
  addCategory,
  updateCategory,
  deleteCategory,
} from '../../stores/categoriesStore';

const FAMILIES: ColorFamily[] = [1, 2, 3, 4, 5, 6];

function FamilyPicker(props: { value: ColorFamily; onChange: (f: ColorFamily) => void }) {
  return (
    <div class="family-picker">
      {FAMILIES.map((f) => (
        <button
          key={f}
          type="button"
          class={`family-swatch ${props.value === f ? 'selected' : ''}`}
          style={{ background: `var(--fam-${f})` }}
          onClick={() => props.onChange(f)}
          aria-label={`Famiglia colore ${f}`}
        />
      ))}
    </div>
  );
}

export function CategoryManager() {
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏷️');
  const [newFamily, setNewFamily] = useState<ColorFamily>(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd() {
    if (!newLabel.trim()) return;
    await addCategory(newLabel.trim(), newEmoji.trim() || '🏷️', newFamily);
    setNewLabel('');
    setNewEmoji('🏷️');
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
                <FamilyPicker value={c.colorFamily} onChange={(f) => updateCategory(c.id, { colorFamily: f })} />
                <button class="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                  Fatto
                </button>
              </>
            ) : (
              <>
                <span class="category-manager-label">
                  <span class="map-legend-dot" style={{ background: `var(--fam-${c.colorFamily})` }} /> {c.emoji} {c.label}
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
        </div>
        <FamilyPicker value={newFamily} onChange={setNewFamily} />
        <button class="btn btn-primary btn-block" disabled={!newLabel.trim()} onClick={handleAdd}>
          Aggiungi categoria
        </button>
      </div>
    </div>
  );
}
