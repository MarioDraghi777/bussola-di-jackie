import { useState } from 'preact/hooks';

export function TagEditor(props: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const value = draft.trim().toLowerCase();
    setDraft('');
    if (value && !props.tags.includes(value)) {
      props.onChange([...props.tags, value]);
    }
  }

  function removeTag(tag: string) {
    props.onChange(props.tags.filter((t) => t !== tag));
  }

  return (
    <div>
      <div class="chip-picker" style={{ marginBottom: 8 }}>
        {props.tags.map((tag) => (
          <button key={tag} type="button" class="chip-tag" onClick={() => removeTag(tag)}>
            #{tag} ✕
          </button>
        ))}
      </div>
      <input
        class="input"
        placeholder="Aggiungi tag e premi invio (es. zozzone, da prenotare…)"
        value={draft}
        onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commitDraft();
          }
        }}
        onBlur={commitDraft}
      />
    </div>
  );
}
