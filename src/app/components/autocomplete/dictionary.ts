import Trie, { OutputNode } from "../Trie";

export type Node = {
  id: string;
  position: { x: number; y: number };
  data: { label: string; highlighted?: boolean; isWord?: boolean };
  type: "trie";
};
export type Edge = { id: string; source: string; target: string };

export const Dictionary = () => {
  const dict = new Trie<string, string>();

  return {
    learn: (word: string) => {
      dict.insert([...word]);
    },
    unlearn: (word: string) => {
      dict.delete(word);
    },
    search: (partial: string) => {
      return dict.find(partial);
    },
    graph: (partial?: string) => {
      const rawGraph = dict.toJSON();

      const nodes: Node[] = [];
      const edges: Edge[] = [];

      traverse(rawGraph, "root", "root", 0, nodes, edges, partial);

      return {
        raw: rawGraph,
        nodes: nodes,
        edges: edges,
      };
    },
  };
};

export type Dictionary = ReturnType<typeof Dictionary>;
export type GraphData = ReturnType<ReturnType<typeof Dictionary>["graph"]>;

const traverse = (
  node: OutputNode<string> | null,
  id: string,
  idSinceRoot: string,
  level: number,
  outputNodes: Node[],
  outputEdges: Edge[],
  partial?: any
) => {
  if (!node) return;
  // 1. make node from value, isWord, tagged, and id passed in from parent
  const newNode: Node = {
    id: idSinceRoot,
    type: "trie",
    position: { x: 0, y: 0 }, // dw, dagre will handle it
    data: {
      label: node.value ?? "empty",
      isWord: node.isWord,
      highlighted: !!partial ? node.tagged === partial : false,
    },
  };
  outputNodes.push(newNode);

  // 2. visit children
  // for every child,
  // - create id,
  // - assign id to each child, and
  // - link the current node to each child, and finally
  // - recurse.
  const nextLevel = level + 1;
  for (const child of node.children) {
    const nextId = `${child.value}-${nextLevel}`;
    const fullId = `${idSinceRoot}-${nextId}`;
    outputEdges.push({ id: fullId, source: idSinceRoot, target: fullId });
    traverse(child, nextId, fullId, nextLevel, outputNodes, outputEdges, partial);
  }
};
