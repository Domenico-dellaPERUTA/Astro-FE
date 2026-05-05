import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const topicsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/topics" }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['html', 'code', 'carousel', 'dictionary', 'chess', 'home', 'md']).default('html'),
    
    // Nuovo sistema gerarchico
    menu: z.string().optional().default('Uncategorized'), // Percorso: "Programmazione/Rust 🦀"
    index: z.number().optional().default(1),              // Ordinamento

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
    
    // Audio per code
    audio: z.string().optional(),
    
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
    })).optional()
  }),
});

export const collections = {
  'topics': topicsCollection,
};
