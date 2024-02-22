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
    const textClass = () => {
      if (data.highlighted) {
        if (data.typed) {
          return "bg-red-600 text-white";
        }
        return "bg-sky-600 text-white";
      }

      return "text-slate-600 bg-white";
    };
    return (
      <div
        className={` rounded-md border
              ${zoomedIn ? "py-1 px-3" : "px-2"}
              ${data.isWord ? "border-sky-700 border-2" : ""}
              ${textClass()}
              `}
      >
        <SimpleHandle type="target" position={Position.Top} isConnectable={isConnectable} />
        <SimpleHandle type="source" position={Position.Bottom} isConnectable={isConnectable} />

        <p className={`${zoomedIn ? "text-xs" : "text-lg font-bold"}`}>{data.label}</p>
      </div>
    );
  }
);

TrieNode.displayName = "TrieNode";
