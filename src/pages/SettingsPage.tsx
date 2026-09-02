import { useRef, useState } from 'preact/hooks';
import { places, reloadPlaces } from '../stores/placesStore';
import { reloadCategories } from '../stores/categoriesStore';
import { exportJson, exportCsv, downloadTextFile, importJson, type ImportJsonResult } from '../services/exportImport';
import { CategoryManager } from '../components/categories/CategoryManager';
import { ShareInvite } from '../components/settings/ShareInvite';
import { navigate } from '../router';

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SettingsPage() {
  const [importResult, setImportResult] = useState<ImportJsonResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExportJson() {
    const json = await exportJson();
    downloadTextFile(`bussola-backup-${dateStamp()}.json`, json, 'application/json');
  }

  async function handleExportCsv() {
    const csv = await exportCsv();
    downloadTextFile(`bussola-posti-${dateStamp()}.csv`, csv, 'text/csv');
  }

  function handleImportFile(file: File) {
    setImportError(null);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await importJson(String(reader.result ?? ''));
        setImportResult(result);
        await Promise.all([reloadPlaces(), reloadCategories()]);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'File non valido.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div class="page">
      <h1 class="page-title">Impostazioni</h1>

      <section class="settings-section">
        <h2 class="settings-heading">Invita amici</h2>
        <p class="hint-text">
          Condividi il link dell'app: chi lo apre ha la propria lista personale, separata dalla tua — non è una lista condivisa.
        </p>
        <ShareInvite />
      </section>

      <section class="settings-section">
        <h2 class="settings-heading">Import in blocco</h2>
        <p class="hint-text">Importa un elenco da un file di testo (come il tuo file "Locali Roma"), con revisione riga per riga.</p>
        <button class="btn btn-primary btn-block" onClick={() => navigate('import')}>
          📥 Vai alla wizard di import
        </button>
      </section>

      <section class="settings-section">
        <h2 class="settings-heading">Backup e portabilità</h2>
        <p class="hint-text">
          {places.value.length} posti salvati sul dispositivo. Il JSON è il formato completo per il backup/ripristino; il CSV serve per
          aprire i dati in un foglio di calcolo.
        </p>
        <button class="btn btn-secondary btn-block" onClick={handleExportJson}>
          ⬇️ Esporta backup JSON
        </button>
        <button class="btn btn-secondary btn-block" onClick={handleExportCsv}>
          ⬇️ Esporta CSV
        </button>
        <label for="import-json-file" class="btn btn-secondary btn-block">
          ⬆️ Reimporta un backup JSON
        </label>
        <input
          id="import-json-file"
          type="file"
          accept="application/json,.json"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleImportFile(file);
          }}
        />
        {importResult && (
          <p class="hint-text">
            ✅ Importati {importResult.importedPlaces} posti e {importResult.importedCategories} categorie
            {importResult.skippedPlaces + importResult.skippedCategories > 0
              ? ` (scartate ${importResult.skippedPlaces + importResult.skippedCategories} voci malformate)`
              : ''}
            .
          </p>
        )}
        {importError && <p class="error-text">{importError}</p>}
      </section>

      <section class="settings-section">
        <h2 class="settings-heading">Categorie</h2>
        <p class="hint-text">Le categorie sono libere: aggiungine di nuove o modifica quelle esistenti in qualsiasi momento.</p>
        <CategoryManager />
      </section>

      <section class="settings-section">
        <h2 class="settings-heading">Informazioni</h2>
        <p class="hint-text">
          I dati vivono solo su questo dispositivo (IndexedDB): consultazione, ricerca e navigazione funzionano offline. Serve
          rete solo per geocodificare un nuovo posto e per scaricare i tile della mappa la prima volta.
        </p>
      </section>
    </div>
  );
}
