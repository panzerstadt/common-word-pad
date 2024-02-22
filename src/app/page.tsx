"use client";
import Dagre from "@dagrejs/dagre";
import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { GraphData } from "./components/autocomplete/dictionary";
import { TrieNode } from "./components/autocomplete/graph/Node";
import { AutoCompleteNotepad, MAX_WORDS } from "./components/autocomplete/notepad";

export default function Tries() {
  return (
    <ReactFlowProvider>
      <Graph />
    </ReactFlowProvider>
  );
}

const customNodeSelectors = {
  trie: TrieNode,
};

const Graph = () => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [graph, setGraph] = useState<GraphData>();

  useEffect(() => {
    if (nodes.length === 0) return;
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "TB" });
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    // @ts-ignore
    nodes.forEach((node) => g.setNode(node.id, { ...node, width: node.id === "root" ? 60 : null }));
    Dagre.layout(g, { nodesep: 0.1, marginx: 0 });

    setNodes([
      ...nodes.map((node) => {
        const { x, y } = g.node(node.id);
        return { ...node, position: { x, y } };
      }),
    ]);

    const highlightedNodes = (nodes as GraphData["nodes"]).filter(
      (n) => n.data.highlighted && n.data.label !== "empty"
    );

    const timer = setTimeout(() => {
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.5, nodes: highlightedNodes, duration: 500 });
      });
    }, 30);

    return () => {
      clearTimeout(timer);
    };
  }, [graph]);

  const handleUpdateGraph = (updatedGraph: GraphData) => {
    if (nodes.length === 0) return;
    const updatedNodes = updatedGraph.nodes;

    // assumption made that the position of nodes in the array never changes
    const newNodes = nodes.map((node, idx) => ({ ...node, data: updatedNodes[idx].data }));
    setNodes(newNodes);

    const highlightedNodes = (newNodes as GraphData["nodes"]).filter(
      (n) => n.data.highlighted && n.data.label !== "empty"
    );

    window.requestAnimationFrame(() => {
      fitView({ padding: 0.5, nodes: highlightedNodes, duration: 500 });
    });
  };

  const handleInitGraph = (newGraph: GraphData) => {
    setGraph(newGraph);
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <AutoCompleteNotepad onUpdate={handleUpdateGraph} onInitGraph={handleInitGraph} />
      <p className="fixed bottom-5 left-20 z-50 bg-slate-50">
        type using the {MAX_WORDS} most common words in the english dictionary, and no more.
      </p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={customNodeSelectors}
        onlyRenderVisibleElements={true}
      >
        <MiniMap nodeStrokeWidth={100} pannable />
        <Controls />
        <Background color="#4C3B4D" />
      </ReactFlow>
    </div>
  );
};
