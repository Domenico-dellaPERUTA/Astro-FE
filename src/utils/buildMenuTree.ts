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
 */
export function buildMenuTree(topics: TopicEntry[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const topic of topics) {
    const menuPath = topic.data.menu || "";
    if (!menuPath) {
      // Se non c'è percorso menu, lo mettiamo alla radice (opzionale)
      root.push({
        name: topic.data.title,
        link: `/topic/${topic.id}`,
        type: topic.data.type,
        index: topic.data.index ?? 1,
        isFolder: false,
      });
      continue;
    }

    const parts = menuPath.split('/').map(p => p.trim()).filter(Boolean);
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const partName = parts[i];
      
      let existingFolder = currentLevel.find(
        (node): node is TreeNodeFolder => node.isFolder === true && node.name === partName
      );

      if (!existingFolder) {
        existingFolder = { name: partName, menu: [], isFolder: true };
        currentLevel.push(existingFolder);
      }

      if (i === parts.length - 1) {
        // Ultimo segmento del percorso: aggiungiamo il topic come foglia
        existingFolder.menu.push({
          name: topic.data.title,
          link: `/topic/${topic.id}`,
          type: topic.data.type,
          index: topic.data.index ?? 1,
          isFolder: false,
        });
      } else {
        // Altro segmento: scendiamo nel sottomenu
        currentLevel = existingFolder.menu;
      }
    }
  }

  // Ordinamento finale
  sortRecursive(root);

  return root;
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
