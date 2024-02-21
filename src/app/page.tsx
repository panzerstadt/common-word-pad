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
import { AutoCompleteNotepad } from "./components/autocomplete/notepad";

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
    g.setGraph({ rankdir: "LR" });
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
        fitView({ padding: 0.5, nodes: highlightedNodes });
      });
    }, 30);

    return () => {
      clearTimeout(timer);
    };
  }, [graph]);

  const handleUpdateGraph = (newGraph: GraphData) => {
    setGraph(newGraph);
    setNodes(newGraph.nodes);
    setEdges(newGraph.edges);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <AutoCompleteNotepad onUpdate={handleUpdateGraph} />
      <p className="fixed bottom-5 left-20">
        type using the 200 most common words in the english dictionary, and no more.
      </p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={customNodeSelectors}
      >
        <MiniMap nodeStrokeWidth={100} pannable />
        <Controls />
        <Background color="#4C3B4D" />
      </ReactFlow>
    </div>
  );
};
