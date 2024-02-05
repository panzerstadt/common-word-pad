import { memo } from "react";
import { Position, ReactFlowState, useStore } from "reactflow";
import { SimpleHandle } from "./Handles";
import { Node } from "../dictionary";

export interface SimpleNodeData {
  label: string;
  enabled?: boolean;
}
const zoomSelector = (s: ReactFlowState) => s.transform[2] >= 0.8;

/**
 * simple node:
 * - shows label
 */
export const TrieNode = memo<{ data: Node["data"]; isConnectable: boolean }>(
  ({ data, isConnectable }) => {
    const zoomedIn = useStore(zoomSelector);
    return (
      <div
        className={` rounded-md border
              ${zoomedIn ? "py-1 px-3" : "px-2"}
              ${data.isWord ? "border-sky-700 border-2" : ""}
              ${data.highlighted ? "bg-sky-600 text-white" : "text-slate-600 bg-white"}
              `}
      >
        <SimpleHandle type="target" position={Position.Left} isConnectable={isConnectable} />
        <SimpleHandle type="source" position={Position.Right} isConnectable={isConnectable} />

        <p className={`${zoomedIn ? "text-xs" : "text-lg font-bold"}`}>{data.label}</p>
      </div>
    );
  }
);

TrieNode.displayName = "TrieNode";
