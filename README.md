# La bussola di Jackie

Archivio personale di posti da visitare (locali, alberghi, attrazioni, musei…), pensato per l'uso dal telefono mentre si è in giro per una città. Funziona offline, non ha account/login, non ha un backend: tutti i dati vivono solo sul tuo dispositivo (IndexedDB del browser).

## Costo

Zero, per sempre. Nessuna API key a pagamento, nessuna carta di credito, nessun piano con soglie di fatturazione:

- **Mappa**: tile vettoriali di [OpenFreeMap](https://openfreemap.org) (gratis per sempre, nessuna key, nessun limite di piano).
- **Geocoding**: [Nominatim](https://nominatim.org) di OpenStreetMap (gratis, nessuna key; il codice rispetta la sua usage policy: max 1 richiesta/secondo, cache dei risultati, nessuna chiamata ripetuta per la stessa ricerca).
- **Storage**: IndexedDB del browser (locale, nessun database gestito).
- **Hosting**: GitHub Pages (statico, gratis).

## Uso dell'app

### Aggiungere un posto (flusso rapido)

Tab **Aggiungi** → scrivi il nome (e opzionalmente la città, precompilata con l'ultima usata) → **Salva**. Da qui:

- Se Nominatim trova **un solo risultato**, il posto viene salvato subito con quelle coordinate: due tap in tutto.
- Se trova **più risultati**, te li mostra e scegli quello giusto.
- Se **non trova nulla**, puoi posizionare il pin a mano su una mappa (trascina la mappa sotto il segnaposto fisso al centro) oppure incollare un link di Google Maps.

Dopo il salvataggio finisci sulla scheda del posto, dove puoi aggiungere categorie, tag, stato, voto e note con calma — non è obbligatorio farlo subito.

### La scheda di un posto

Ogni posto ha un pulsante **🧭 Naviga**: apre Google Maps in navigazione verso quelle coordinate, con l'app nativa se installata (sia su iOS che su Android) o il browser altrimenti.

Puoi modificare in qualsiasi momento: nome, città, posizione (pulsante "Modifica pin"), categorie (un posto può averne più di una), tag liberi, stato (**da provare / visitato / scartato**), e per i visitati voto (1-5), data e nota.

### Mappa

Tab **Mappa**: tutti i posti come pin colorati per categoria (raggruppate in 6 famiglie cromatiche, ogni categoria ha anche un'emoji propria così l'identità non dipende solo dal colore), filtrabili con lo stesso pannello filtri della lista. Un tap su un pin apre la scheda del posto.

### Vicino a me

Tab **Vicino**: attiva la geolocalizzazione e mostra i posti ordinati per distanza reale (in metri/km), con un filtro a raggio regolabile. La posizione si aggiorna solo su richiesta (pulsante "Aggiorna posizione"), non in continuo, per non consumare batteria.

### Ricerca e filtri

In cima alla lista: testo libero (cerca in nome, note e tag) + pulsante **Filtri** per categoria, tag, stato, città e distanza, tutti combinabili tra loro e condivisi tra Lista, Mappa e Vicino a me.

### Import in blocco

**Impostazioni → Import in blocco** (oppure tab Aggiungi → non presente in tabbar per non affollarla, ma sempre raggiungibile da Impostazioni). Puoi:

1. Usare il pulsante **"Usa la lista iniziale di Roma"**, che importa il file `Locali Roma.txt` originale già incluso nell'app.
2. Caricare un tuo file `.txt` nello stesso formato (intestazioni di sezione + elenco puntato con `◦`, note tra parentesi).
3. Incollare il testo direttamente.

Il parser riconosce automaticamente le sezioni (Colazione, Pranzo/cena, Aperitivo…) e mappa parole chiave nel testo su categorie e tag (fermate metro, "anche pranzo", cucine etniche tra parentesi, ecc.). Poi geocodifica ogni riga **in sequenza**, rispettando il limite di Nominatim (circa 1 posto ogni secondo: per ~140 posti ci vogliono un paio di minuti) — puoi cambiare tab e tornare, il progresso resta.

Alla fine (o anche durante) arrivi alla **revisione**: ogni riga mostra cosa ha trovato il geocoder, un'eventuale somiglianza con un posto già salvato, e i controlli per approvare, correggere (nome, città, categorie, tag, posizione) o scartare. Solo le righe **approvate** vengono salvate quando premi "Importa N posti". Le righe ambigue o non trovate non vanno mai perse: restano nella revisione finché non le risolvi o le scarti tu esplicitamente.

### Backup ed export

**Impostazioni → Backup e portabilità**:

- **Esporta backup JSON**: tutti i posti e le categorie, in un formato che l'app stessa sa reimportare (utile per spostarsi su un altro telefono o come backup periodico). Reimportare lo stesso file è sicuro: sovrascrive le voci con lo stesso id invece di duplicarle.
- **Esporta CSV**: per aprire i dati in un foglio di calcolo (categorie e tag multipli sono separati da `;` dentro la cella).

### PWA

Da un browser mobile, "Aggiungi a schermata Home" installa l'app con icona propria e funzionamento a schermo intero. Una volta aperta almeno una volta online, consultazione, ricerca e navigazione funzionano anche offline: serve rete solo per geocodificare un posto nuovo o scaricare i tile della mappa mai visti prima (che poi restano in cache).

## Come aggiungere una categoria nuova

Nessun tocco al codice: **Impostazioni → Categorie → Aggiungi categoria**. Scegli un'emoji, un nome e una delle 6 famiglie di colore (usate per distinguere i pin sulla mappa). Le categorie di serie si possono rinominare ma non eliminare (per non rompere il mapping automatico dell'import); quelle che aggiungi tu si possono anche eliminare — i posti che le usavano restano, semplicemente perdono quel tag di categoria.

## Come faccio il backup

**Impostazioni → Backup e portabilità → Esporta backup JSON**. Tienilo da parte (es. in un cloud storage personale, o mandalo a te stesso): per ripristinarlo su questo o un altro dispositivo usa **"Reimporta un backup JSON"** nella stessa schermata.

## Cosa fare se il geocoding non trova un posto

Non è mai un blocco: il posto puoi comunque salvarlo, con una delle due alternative che l'app propone da sola quando la ricerca fallisce (o quando vuoi correggere una posizione sbagliata, dal pulsante "Modifica pin" nella scheda):

1. **Posiziona il pin a mano**: si apre una mappa con un segnaposto fisso al centro, muovi la mappa sotto di esso finché non è nel punto giusto, poi conferma.
2. **Incolla un link Google Maps**: copia il link di condivisione del posto da Google Maps (quello "esteso", tipo `https://www.google.com/maps/place/...` o con `@lat,lng` nell'URL) e incollalo — l'app estrae le coordinate da sola.

L'unico caso che l'app non può risolvere da sola è un link **abbreviato** (`maps.app.goo.gl/...` o `goo.gl/maps/...`): per come funzionano questi link, espanderli richiederebbe un server proprio, che l'app volutamente non ha. Aprilo nel browser del telefono, aspetta che l'indirizzo si espanda nella barra in alto, e incolla quello.

In nessun caso un posto viene salvato con coordinate inventate: se non geocodifichi né posizioni il pin, semplicemente non si salva ancora (per l'aggiunta rapida) o la riga resta "da risolvere" (nell'import in blocco).

## Sviluppo locale

```bash
npm install              # installa le dipendenze
npm run dev              # avvia in locale (http://localhost:5173)
npm test                 # esegue i test (parser import, geocoding, distanza, filtri, CSV…)
npm run generate-icons   # rigenera le icone PWA in public/icons (serve solo se le cancelli)
npm run build            # build di produzione in dist/
npm run preview          # serve la build di produzione in locale, per un ultimo controllo
```

Il file `public/seed/locali-roma.txt` è il tuo `Locali Roma.txt` originale: è servito staticamente dall'app stessa (pulsante "Usa la lista iniziale di Roma" nell'import), non serve un import da riga di comando.

## Deploy su GitHub Pages

Setup una tantum (questa parte richiede per forza il tuo account GitHub, non è automatizzabile da uno script):

1. Crea un repository vuoto su GitHub (es. `bussola-di-jackie`).
2. `git remote add origin https://github.com/<tuo-utente>/<repo>.git`
3. Nelle impostazioni del repository → **Pages** → **Source**: scegli **GitHub Actions**.

Da qui in poi è tutto automatico:

```bash
git push -u origin main
```

Il workflow in `.github/workflows/deploy.yml` builda e pubblica ad ogni push su `main`. In alternativa, per un deploy manuale senza GitHub Actions:

```bash
npm run deploy   # build + pubblica dist/ sul branch gh-pages
```

## Stack tecnico (perché)

- **Vite + Preact + TypeScript**: build veloce, bundle minimo, zero backend necessario per compilare a statico puro.
- **@preact/signals**: stato reattivo senza boilerplate (niente Redux/Context da orchestrare per 6 schermate).
- **Dexie (IndexedDB)**: unico storage del browser che regge centinaia di posti con query indicizzate e sopravvive alla chiusura del browser.
- **MapLibre GL + OpenFreeMap**: mappa vettoriale gratis per sempre, senza key.
- **Nominatim**: unico geocoder realmente gratuito senza key, con cache locale e throttling per rispettarne la policy.
- **vite-plugin-pwa**: manifest e service worker generati in build, per l'installabilità e l'uso offline.
- Nessuna libreria per CSV, similarità testo, o routing: per la dimensione dell'app scriverle a mano (poche decine di righe ciascuna) costa meno di una dipendenza in più.

## Limiti noti

- Il geocoding automatico funziona bene per luoghi con un nome distintivo; per locali piccoli con nomi generici ("Vetro", "Trecca"…) Nominatim spesso non trova nulla o trova più candidati ambigui — è normale, ed è proprio per questo che esiste la schermata di revisione e il posizionamento manuale.
- I link Google Maps abbreviati non sono espandibili senza un server (vedi sopra).
- La sincronizzazione fra dispositivi non è automatica: il meccanismo "gratis, facoltativo, disattivato di default" richiesto è l'export/import JSON manuale — niente account né infrastruttura da mantenere.
