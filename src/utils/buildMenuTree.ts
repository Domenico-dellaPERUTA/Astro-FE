/**
 * buildMenuTree.ts
 * 
 * Trasforma la collezione piatta dei topic in un albero nidificato a cartelle.
 * 
 * Input:  Array di topic con { data: { title, type, menu, index, images?, pgn? }, id }
 * Output: Array di nodi menu nidificati per MenuMaster/MenuItem
 */

interface TopicEntry {
  id: string;
  data: {
    title: string;
    type: string;
    menu: string;
    index: number;
    images?: string[];
    pgn?: string;
  };
}

interface TreeNodeFolder {
  name: string;
  menu: TreeNode[];
  isFolder: true;
}

interface TreeNodeLeaf {
  name: string;
  link: string;
  type: string;
  index: number;
  isFolder: false;
}

type TreeNode = TreeNodeFolder | TreeNodeLeaf;

/**
 * Costruisce l'albero del menu a partire dalla collezione piatta dei topic.
 * Mostra la struttura di cartelle e aggiunge link alle cartelle foglia.
 */
export function buildMenuTree(topics: TopicEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  
  // Mappa delle cartelle per aggiungere i link
  const categoryMap = new Map<string, TopicEntry[]>();

  // Prima passata: costruisci l'albero e raccogli file per categoria
  for (const topic of topics) {
    const menuPath = topic.data.menu || "";
    if (!menuPath) {
      continue;
    }

    // Raccolgi i file per categoria (usando menuPath come chiave)
    if (!categoryMap.has(menuPath)) {
      categoryMap.set(menuPath, []);
    }
    categoryMap.get(menuPath)!.push(topic);

    const parts = menuPath.split('/').map(p => p.trim()).filter(Boolean);
    let currentLevel = root;

    // Iteriamo tutti i segmenti del percorso e creiamo cartelle
    for (let i = 0; i < parts.length; i++) {
      const partName = parts[i];
      
      let existingFolder = currentLevel.find(
        (node): node is TreeNodeFolder => node.isFolder === true && node.name === partName
      );

      if (!existingFolder) {
        existingFolder = { name: partName, menu: [], isFolder: true };
        currentLevel.push(existingFolder);
      }

      // Scendiamo nel sottomenu
      currentLevel = existingFolder.menu;
    }

    // [MODIFICA] Aggiungi il topic stesso come nodo foglia nella cartella finale
    currentLevel.push({
      name: topic.data.title,
      link: `/topic/${topic.id}`,
      type: topic.data.type,
      index: topic.data.index ?? 1,
      isFolder: false
    });
  }

  // Seconda passata: aggiungi i link alle cartelle foglia
  addLinksToLeafFolders(root, categoryMap, topics);

  // Ordinamento finale
  sortRecursive(root);

  return root;
}

/**
 * Aggiunge un link alle cartelle foglia (leaf) che non contengono altre cartelle.
 * Il link punta al primo file (index minore) di quella categoria.
 */
function addLinksToLeafFolders(
  nodes: TreeNode[],
  categoryMap: Map<string, TopicEntry[]>,
  allTopics: TopicEntry[]
) {
  for (const node of nodes) {
    if (!node.isFolder) continue;

    // Controlla se questa cartella è una foglia (non contiene altre cartelle)
    const hasSubFolders = node.menu.some((n): n is TreeNodeFolder => n.isFolder === true);

    if (!hasSubFolders && node.menu.length === 0) {
      // È una cartella foglia vuota - aggiungiamo il link al primo file di questa categoria
      const categoryKey = Array.from(categoryMap.entries()).find(([_key, files]) =>
        files.some(f => f.data.menu?.endsWith(node.name))
      )?.[0];

      if (categoryKey) {
        const filesInCategory = categoryMap.get(categoryKey) || [];
        // Ordina per index e prendi il primo
        const firstFile = filesInCategory.sort((a, b) => (a.data.index ?? 1) - (b.data.index ?? 1))[0];
        
        if (firstFile) {
          (node as any).link = `/topic/${firstFile.id}`;
          (node as any).type = firstFile.data.type;
          (node as any).index = firstFile.data.index ?? 1;
        }
      }
    } else {
      // Ricorsivamente processa i sottomenu
      addLinksToLeafFolders(node.menu, categoryMap, allTopics);
    }
  }
}

function sortRecursive(nodes: TreeNode[]) {
  // Ordiniamo il livello corrente: cartelle prima per nome, poi foglie per index
  nodes.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    if (a.isFolder && b.isFolder) return a.name.localeCompare(b.name);
    return (a as TreeNodeLeaf).index - (b as TreeNodeLeaf).index;
  });

  // Ricorsione sui sottomenu
  for (const node of nodes) {
    if (node.isFolder) {
      sortRecursive(node.menu);
    }
  }
}

/**
 * Trova i siblings (topic con lo stesso percorso menu) per un dato topic.
 */
export function findSiblings(topics: TopicEntry[], currentMenuPath: string): TreeNodeLeaf[] {
  return topics
    .filter(t => (t.data.menu || "") === (currentMenuPath || ""))
    .map(t => ({
      name: t.data.title,
      link: `/topic/${t.id}`,
      type: t.data.type,
      index: t.data.index ?? 1,
      isFolder: false,
    }))
    .sort((a, b) => a.index - b.index);
}
