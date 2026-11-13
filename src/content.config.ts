import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const topicsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/topics" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['html', 'code', 'carousel', 'video', 'dictionary', 'chess', 'home', 'md', 'steps']).default('html'),
    
    // Nuovo sistema gerarchico
    menu: z.string().optional().default('Uncategorized'), // Percorso: "Programmazione/Rust 🦀"
    index: z.number().optional().default(1),              // Ordinamento

    // Bozze: visible: false → nessuna pagina (404): nascoste dal menu,
    // dalla navigazione tra siblings e dall'accesso via URL diretto
    visible: z.boolean().optional().default(true),

    // Dati specifici per il carousel (es. lista immagini)
    images: z.array(z.union([
      z.string(),
      z.object({
        image: z.string(),
        title: z.string().optional(),
        text: z.string().optional()
      })
    ])).optional(),
    
    // Dati specifici per gli scacchi (pgn)
    pgn: z.string().optional(),
    
    // Audio per code/md/html/steps: percorso file mp3 oppure `true` per abilitare sintesi vocale
    // Il pulsante audio viene mostrato solo se questo attributo è presente
    audio: z.union([z.string(), z.boolean()]).optional(),

    // Per il tipo "steps": quando l'audio di uno step termina, avanza automaticamente
    // al prossimo (slide narrata stile PowerPoint). Richiede audio (TTS o data-audio).
    autoplay: z.boolean().optional(),

    // Dati specifici per il tipo "steps" (presentazione a slide stile PowerPoint):
    // slide definite in YAML nel frontmatter. Ogni passo ha un testo (HTML inline
    // e formule KaTeX ammessi) oppure un blocco html: libero per la grafica complessa
    // (SVG, .step-canvas, sovrapposizioni). Se `slides` è presente viene usato il
    // formato YAML, altrimenti il body HTML con data-step/data-fx (entrambi validi).
    slides: z.array(z.object({
      title: z.string().optional(),        // titolo della slide (h2, è il passo 1)
      center: z.boolean().optional(),      // OPT-IN: contenuto centrato in verticale
      centerBoth: z.boolean().optional(),  // OPT-IN: centrato anche in orizzontale
      audio: z.string().optional(),        // mp3 riprodotto all'ingresso nella slide
      background: z.string().optional(),   // sfondo personalizzato della slide
      steps: z.array(z.object({
        text: z.string().optional(),       // testo del passo (HTML inline + KaTeX)
        html: z.string().optional(),       // blocco HTML libero (grafica complessa)
        tag: z.string().optional(),        // tag del blocco di testo (default: p)
        fx: z.string().optional(),         // effetto d'ingresso (default: fade)
        out: z.number().optional(),        // uscita animata al passo N
        audio: z.string().optional(),      // mp3 riprodotto alla comparsa del blocco
        center: z.boolean().optional(),    // blocco centrato orizzontalmente
      })).min(1),
    })).optional(),
    
    // Dati specifici per il video carousel (lista URL video esterni)
    videos: z.array(z.union([
      z.string(),
      z.object({
        url: z.string(),
        title: z.string().optional(),
        text: z.string().optional()
      })
    ])).optional(),
    
    // Dati per dizionario
    dictionary: z.array(z.object({
      item: z.string(),
      description: z.string(),
      type: z.string(),
      fonetic: z.string().optional(),
      path: z.string().optional(),
      codeDescription: z.string().optional(),
      links: z.string().optional(),
      synonyms: z.string().optional(),
      opposites: z.string().optional(),
      note: z.string().optional(),
      codeView: z.string().optional(),
    })).optional()
  }),
});

export const collections = {
  'topics': topicsCollection,
};
