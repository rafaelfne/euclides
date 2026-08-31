'use client'

import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type NodeProps,
} from '@xyflow/react'
import type { FlowNode } from './FlowCanvas'

const nodeTypes = { euclides: FlowNodeView }

function FlowNodeView({ data }: NodeProps<FlowNode>) {
  const direction = data.direction ?? 'horizontal'
  return (
    <>
      <Handle type="target" position={direction === 'vertical' ? Position.Top : Position.Left} />
      <Handle type="target" id="top" position={Position.Top} />
      <Handle type="target" id="bottom" position={Position.Bottom} />
      <div className={`euclides-flow__node euclides-flow__node--${data.tone ?? 'neutral'}${data.faded ? ' euclides-flow__node--faded' : ''}`}>
        <span className="euclides-flow__node-mark" aria-hidden="true" />
        <span className="euclides-flow__node-copy">
          <span className="euclides-flow__node-label">{data.label}</span>
          {data.secondary && <small>{data.secondary}</small>}
        </span>
      </div>
      <Handle type="source" position={direction === 'vertical' ? Position.Bottom : Position.Right} />
      <Handle type="source" id="top" position={Position.Top} />
      <Handle type="source" id="bottom" position={Position.Bottom} />
    </>
  )
}

export function FlowCanvasView({
  nodes,
  edges,
  height,
  ariaLabel,
}: {
  nodes: FlowNode[]
  edges: import('@xyflow/react').Edge[]
  height: number
  ariaLabel: string
}) {
  return (
    <div className="euclides-flow" style={{ height }} role="img" aria-label={ariaLabel}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        panOnScroll={false}
        minZoom={0.45}
        maxZoom={1.8}
      >
        <Background variant={BackgroundVariant.Dots} color="var(--rule-soft)" gap={18} size={1} />
      </ReactFlow>
    </div>
  )
}
