// app/components/MarkdownEditor/markdownData.ts
// Snippet di inserimento e modelli pronti per l'Editor Markdown Online.
// Mirrors the data-driven structure of LatexEditor/latexData.ts

export interface MdSnippet {
  id: string;
  /** Etichetta mostrata sul pulsante (es. **B**, H2, > ) */
  name: string;
  /** Testo inserito prima della selezione/placeholderr */
  before: string;
  /** Testo inserito dopo la selezione/placeholder */
  after: string;
  /** Testo inserito quando non c'è selezione */
  placeholder: string;
  /** Inserisce `before` all'inizio della riga corrente (titoli, liste, citazioni) */
  lineStart?: boolean;
  /** Testo completo multilinea da inserire (blocco inserito per intero) */
  text?: string;
  /** Descrizione mostrata nel tooltip */
  desc: string;
}

export interface MdCategory {
  id: string;
  name: string;
  /** Nome dell'icona lucide (risolta in MarkdownEditorApp.vue) */
  iconName: string;
  snippets: MdSnippet[];
}

export interface MdTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  markdown: string;
}

export const MD_CATEGORIES: MdCategory[] = [
  {
    id: 'testo',
    name: 'Testo',
    iconName: 'Type',
    snippets: [
      {
        id: 'h1',
        name: 'H1',
        before: '# ',
        after: '',
        placeholder: 'Titolo di primo livello',
        lineStart: true,
        desc: 'Titolo di livello 1 (#)'
      },
      {
        id: 'h2',
        name: 'H2',
        before: '## ',
        after: '',
        placeholder: 'Titolo di secondo livello',
        lineStart: true,
        desc: 'Titolo di livello 2 (##)'
      },
      {
        id: 'h3',
        name: 'H3',
        before: '### ',
        after: '',
        placeholder: 'Titolo di terzo livello',
        lineStart: true,
        desc: 'Titolo di livello 3 (###)'
      },
      {
        id: 'h4',
        name: 'H4',
        before: '#### ',
        after: '',
        placeholder: 'Titolo di quarto livello',
        lineStart: true,
        desc: 'Titolo di livello 4 (####)'
      },
      {
        id: 'bold',
        name: 'Bold',
        before: '**',
        after: '**',
        placeholder: 'testo in grassetto',
        desc: 'Grassetto (**testo**)'
      },
      {
        id: 'italic',
        name: 'Italico',
        before: '*',
        after: '*',
        placeholder: 'testo in corsivo',
        desc: 'Corsivo (*testo*)'
      },
      {
        id: 'strike',
        name: 'Barrato',
        before: '~~',
        after: '~~',
        placeholder: 'testo barrato',
        desc: 'Testo barrato (~~testo~~)'
      },
      {
        id: 'code-inline',
        name: 'Inline',
        before: '`',
        after: '`',
        placeholder: 'codice',
        desc: 'Codice in linea (`codice`)'
      }
    ]
  },
  {
    id: 'blocchi',
    name: 'Blocchi',
    iconName: 'AlignLeft',
    snippets: [
      {
        id: 'quote',
        name: 'Citazione',
        before: '> ',
        after: '',
        placeholder: 'Testo della citazione',
        lineStart: true,
        desc: "Blocco citazione (> testo)"
      },
      {
        id: 'callout',
        name: 'Callout',
        before: '',
        after: '',
        placeholder: '',
        text: '> [!NOTE]\n> Messaggio di evidenza per GitHub / Markdown avanzato',
        desc: "Blocco evidente stile GitHub ([!NOTE], [!TIP], [!WARNING]...)"
      },
      {
        id: 'code-block',
        name: 'Codice',
        before: '',
        after: '',
        placeholder: '',
        text: '```js\n// il tuo codice qui\nfunction saluta() {\n  console.log("Ciao!");\n}\n```',
        desc: 'Blocco codice con evidenziatore sintattico (```lang ... ```)'
      },
      {
        id: 'hr',
        name: 'Orizzontale',
        before: '\n\n---\n\n',
        after: '',
        placeholder: '',
        desc: 'Linea orizzontale di separazione (---)'
      }
    ]
  },
  {
    id: 'liste',
    name: 'Liste',
    iconName: 'List',
    snippets: [
      {
        id: 'ul',
        name: 'Elenchi',
        before: '- ',
        after: '',
        placeholder: 'Voce di elenco puntato',
        lineStart: true,
        desc: 'Elenco puntato (- voce)'
      },
      {
        id: 'ol',
        name: 'Numerata',
        before: '1. ',
        after: '',
        placeholder: 'Prima voce numerata',
        lineStart: true,
        desc: 'Elenco numerato (1. voce)'
      },
      {
        id: 'task',
        name: 'Attività',
        before: '- [ ] ',
        after: '',
        placeholder: 'Attività da completare',
        lineStart: true,
        desc: 'Elenco di attività (checkbox)'
      },
      {
        id: 'task-done',
        name: 'Completata',
        before: '- [x] ',
        after: '',
        placeholder: 'Attività completata',
        lineStart: true,
        desc: 'Elemento di attività già completato (- [x] voce)'
      },
      {
        id: 'nested',
        name: 'Annidata',
        before: '  - ',
        after: '',
        placeholder: 'Voce annidata',
        lineStart: true,
        desc: 'Voce di elenco annidata (indentazione)'
      }
    ]
  },
  {
    id: 'media',
    name: 'Media',
    iconName: 'Image',
    snippets: [
      {
        id: 'link',
        name: 'Link',
        before: '[',
        after: '](https://)',
        placeholder: 'testo del link',
        desc: 'Collegamento ipertestuale ([testo](url))'
      },
      {
        id: 'image',
        name: 'Immagine',
        before: '![',
        after: '](https://)',
        placeholder: 'testo alternativo',
        desc: 'Immagine (![alt](url))'
      },
      {
        id: 'table',
        name: 'Tabella',
        before: '',
        after: '',
        placeholder: '',
        text: '| Colonna A | Colonna B | Colonna C |\n|-----------|-----------|-----------|\n| dato 1    | dato 2    | dato 3    |\n| dato 4    | dato 5    | dato 6    |',
        desc: 'Tabella Markdown (pipe)'
      },
      {
        id: 'details',
        name: 'Dettagli',
        before: '',
        after: '',
        placeholder: '',
        text: '<details>\n<summary>Titolo del pannello</summary>\n\nContenuto espandibile (HTML in Markdown).\n\n</details>',
        desc: 'Blocco espandibile (HTML <details>)'
      }
    ]
  },
  {
    id: 'matematica',
    name: 'Matematica',
    iconName: 'Sigma',
    snippets: [
      {
        id: 'math-inline',
        name: '$ Inline',
        before: '$',
        after: '$',
        placeholder: 'x^2 + y^2 = z^2',
        desc: 'Formula KaTeX in linea ($...$)'
      },
      {
        id: 'math-display',
        name: '$$ Blocco',
        before: '\n$$\n',
        after: '\n$$\n',
        placeholder: 'E = mc^2',
        desc: 'Formula KaTeX visualizzata ($$...$$)'
      },
      {
        id: 'frac',
        name: 'a/b',
        before: '\\frac{',
        after: '}{b}',
        placeholder: 'a',
        desc: 'Frazione LaTeX (da usare dentro $...$)'
      },
      {
        id: 'sqrt',
        name: '√',
        before: '\\sqrt{',
        after: '}',
        placeholder: 'x',
        desc: 'Radice quadrata LaTeX (da usare dentro $...$)'
      },
      {
        id: 'sum',
        name: 'Σ',
        before: '\\sum_{i=1}^{n} ',
        after: '',
        placeholder: 'x_i',
        desc: 'Sommatoria LaTeX (da usare dentro $...$)'
      },
      {
        id: 'matrix',
        name: 'Matrice',
        before: '',
        after: '',
        placeholder: '',
        text: '$$\n\\begin{pmatrix}\n  a & b \\\\\n  c & d\n\\end{pmatrix}\n$$',
        desc: 'Matrice LaTeX con parentesi (pmatrix)'
      }
    ]
  }
];

export const MD_TEMPLATES: MdTemplate[] = [
  {
    id: 'articolo-base',
    title: 'Articolo Base',
    category: 'Documenti',
    description: 'Struttura classica per un articolo: titolo, introduzione, sezioni e conclusione.',
    markdown: `# Titolo dell'Articolo

*Autore · Data · Categoria*

## Introduzione

Breve testo che presenta l'argomento e cattura l'attenzione del lettore.

## Sviluppo

### Una sezione importante

Il contenuto principale con **parole chiave in grassetto** e *osservazioni in corsivo*.

- Punto chiave numero uno
- Punto chiave numero due
- Punto chiave numero tre

> Un pensiero o una citazione di supporto.

## Conclusione

Riassunto finale e invito all'azione.
`
  },
  {
    id: 'readme',
    title: 'README Progetto',
    category: 'Sviluppo',
    description: 'Scafo completo per la documentazione di un repository: installazione, uso e licenza.',
    markdown: `# Nome del Progetto

Breve descrizione di cosa fa e perché esiste.

## 🚀 Installazione

\`\`\`bash
git clone https://github.com/utente/progetto.git
cd progetto
npm install
\`\`\`

## 🛠️ Utilizzo

\`\`\`js
import { saluta } from './progetto';

saluta('Mondo');
\`\`\`

## 📦 Caratteristiche

| Caratteristica | Stato    | Note              |
|----------------|----------|-------------------|
| Funzione X     | ✅ pronto| Testata e stabile |
| Funzione Y     | 🚧 WIP   | In sviluppo       |

## 📄 Licenza

Distribuito con licenza MIT.
`
  },
  {
    id: 'appunti-studio',
    title: 'Appunti di Studio',
    category: 'Appunti',
    description: 'Appunti con definizioni, formule matematiche e riepilogo.',
    markdown: `# Lezione: Derivate

> **Definizione** La derivata di \`f(x)\` misura la velocità di variazione della funzione.

## Formula fondamentale

$$
f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}
$$

## Esempi notevoli

| Funzione    | Derivata     |
|-------------|--------------|
| $x^n$       | $n x^{n-1}$  |
| $\\sin x$   | $\\cos x$    |
| $e^x$       | $e^x$        |

## Da ricordare

- [x] Regola della potenza
- [ ] Regola del prodotto
- [ ] Teorema di Rolle
`
  },
  {
    id: 'doc-codice',
    title: 'Documentazione Codice',
    category: 'Sviluppo',
    description: 'Guida tecnica con blocchi di codice in più linguaggi.',
    markdown: `# Documentazione API

## Endpoint disponibili

### \`GET /api/elementi\`

Restituisce l'elenco completo degli elementi.

**Parametri di query**

\`\`\`http
GET /api/elementi?limite=10&ordina=nome
\`\`\`

**Esempio di risposta**

\`\`\`json
{
  "totale": 2,
  "elementi": [
    { "id": 1, "nome": "Alpha" },
    { "id": 2, "nome": "Beta" }
  ]
}
\`\`\`

### \`POST /api/elementi\`

Crea un nuovo elemento. In caso di errore:

\`\`\`js
try {
  const res = await fetch('/api/elementi', { method: 'POST', body });
} catch (err) {
  console.error('Richiesta non riuscita', err);
}
\`\`\`
`
  },
  {
    id: 'comparativa',
    title: 'Tabella Comparativa',
    category: 'Tabelle',
    description: 'Confronto strutturato tra opzioni, con pro e contro.',
    markdown: `# Confronto tra Opzioni

| Criterio        | Opzione A         | Opzione B          |
|-----------------|-------------------|--------------------|
| Prezzo          | €10/mese          | €0 (gratuito)      |
| Facilità d'uso  | ★★★★★             | ★★★☆☆              |
| Supporto        | 24/7              | Community          |
| Open source     | ❌                | ✅                 |

## Analisi

- **Opzione A** conviene quando serve affidabilità garantita.
- **Opzione B** è ideale per prime prove e sperimentazioni.

> Suggerimento: *inizia con la versione gratuita, passa al piano a pagamento solo quando il progetto cresce.*
`
  },
  {
    id: 'checklist',
    title: 'Checklist Settimanale',
    category: 'Produttività',
    description: 'Elenco di attività con checkbox per la migliore organizzazione.',
    markdown: `# Checklist della Settimana

## Lavoro

- [x] Preparare il resoconto mensile
- [ ] Aggiornare la pianificazione
- [ ] Rivedere le proposte in entrata

## Casa

- [ ] Spesa settimanale
- [x] Pulizia generale

## Appunti

> Priorità la settimana prossima: **conclusione del progetto astronomico**.
`
  },
  {
    id: 'guida-rapida',
    title: 'Guida Rapida (Cheatsheet)',
    category: 'Documenti',
    description: 'Tavole di sintesi con tutti i comandi markdown principali.',
    markdown: `# Markdown Cheatsheet

## Testo

| Markdown            | Risultato              |
|---------------------|------------------------|
| \`**grassetto**\`    | **grassetto**          |
| \`*corsivo*\`        | *corsivo*              |
| \`~~barrato~~\`      | ~~barrato~~            |
| \`codice\`           | \`codice\`             |

## Blocchi

\`\`\`python
# Esempio di blocco di codice
def ciao():
    print("Ciao dal Markdown!")
\`\`\`

## Liste

1. Primo elemento
2. Secondo elemento
   - Annidamento con due spazi
- [ ] Attività da fare
- [x] Attività completata

## Matematica

In linea: la massa è $E = mc^2$.

$$
\\int_0^\\infty e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
$$
`
  },
  {
    id: 'riunione',
    title: 'Verbale di Riunione',
    category: 'Ufficio',
    description: 'Registro di riunione: partecipanti, ordine del giorno e azioni.',
    markdown: `# Verbale di Riunione

**Data:** 8 novembre 2026 · **Ora:** 10:00 · **Posizione:** Sala 2 / Video

## Partecipanti

Alice B., Marco R., Silvia T., Luca P.

## Ordine del giorno

1. Bilancio del trimestre
2. Nuove proposte dall'ufficio contenuti
3. Sperimentazione dell'editor Markdown nel sito

## Decisioni

> Decisione presa: **il nuovo editor Markdown entra in produzione con il laysite di dicembre**.

## Azioni da intraprendere

- [x] Preparare la bozza dell'editor — Alice
- [ ] Inviare l'annuncio al team — Marco
- [ ] Fissare la data della revisione finale — Silvia
`
  }
];
