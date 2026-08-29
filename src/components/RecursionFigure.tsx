'use client'

import { useMemo } from 'react'
import {
  ReactFlow, Background, type Edge, type Node, type NodeProps, Handle, Position,
} from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import type { Figure } from '@/content/schema'
import { Stepper } from './Stepper'

/**
 * A árvore de recursão de `asymptotics.c4`, desenhando-se nível a nível.
 *
 * O ciclo se chama "A árvore de recursão, desenhada" e não tinha desenho: a
 * tabela do exercício conferia uma derivação que o aluno nunca via. Aqui o
 * desenho e a tabela mostram a mesma conta, e a tabela continua sendo o
 * equivalente textual exigido pela acessibilidade.
 *
 * Tudo é derivado de `branches`, `divisor` e `n`. As duas afirmações que a
 * figura precisa fazer saem sozinhas da recorrência, e é por isso que ela não
 * pode discordar do texto: **o custo por nível não cresce**, porque as chamadas
 * multiplicam por `branches` enquanto o tamanho divide por `divisor`; e **o
 * número de níveis é log na base do divisor**, não n. Ver ADR-0025.
 *
 * A marca d'água do React Flow fica. Removê-la exige assinatura Pro, e o
 * projeto não tem uma.
 */
type Level = { level: number; calls: number; size: number; cost: number }

function levelsOf(figure: Extract<Figure, { kind: 'recursion' }>): Level[] {
  const out: Level[] = []
  let size = figure.n
  let calls = 1
  let level = 0
  while (size >= 1) {
    out.push({ level, calls, size, cost: calls * size })
    if (size === 1) break
    size = size / figure.divisor
    calls = calls * figure.branches
    level += 1
  }
  return out
}

type CallData = { size: number; muted: boolean }

function CallNode({ data }: NodeProps<Node<CallData>>) {
  return (
    <div
      className="flex items-center justify-center border font-mono text-[11px]"
      style={{
        width: 46, height: 26,
        borderColor: data.muted ? 'var(--rule)' : 'var(--contract)',
        background: data.muted ? 'var(--panel)' : 'var(--contract-bg)',
        color: data.muted ? 'var(--fg-5)' : 'var(--fg)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.size === 1 ? 'n' : `n/${data.size}`}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
}

const nodeTypes = { call: CallNode }

export function RecursionFigure({ figure, autoPlay }: { figure: Extract<Figure, { kind: 'recursion' }>; autoPlay?: boolean }) {
  const levels = useMemo(() => levelsOf(figure), [figure])

  const build = (upTo: number): { nodes: Node<CallData>[]; edges: Edge[] } => {
    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: 'TB', nodesep: 12, ranksep: 34 })
    g.setDefaultEdgeLabel(() => ({}))

    const nodes: Node<CallData>[] = []
    const edges: Edge[] = []

    levels.forEach((l, i) => {
      // Acima de 8 chamadas o nível vira uma faixa: desenhar 32 caixas de 46px
      // não ensina nada que 8 não ensinem, e estoura a largura.
      const drawn = Math.min(l.calls, 8)
      for (let k = 0; k < drawn; k++) {
        const id = `${i}-${k}`
        nodes.push({
          id, type: 'call', position: { x: 0, y: 0 },
          // O rótulo é a fração, não o valor: é assim que a recorrência é lida.
          data: { size: Math.round(figure.n / l.size), muted: i > upTo },
        })
        g.setNode(id, { width: 46, height: 26 })
        if (i > 0) {
          const parent = `${i - 1}-${Math.min(Math.floor(k / figure.branches), Math.min(levels[i - 1]!.calls, 8) - 1)}`
          edges.push({
            id: `${parent}->${id}`, source: parent, target: id,
            style: { stroke: i > upTo ? 'var(--rule)' : 'var(--contract-rule)', strokeWidth: 1.2 },
          })
          g.setEdge(parent, id)
        }
      }
    })

    dagre.layout(g)
    for (const n of nodes) {
      const p = g.node(n.id)
      n.position = { x: p.x - 23, y: p.y - 13 }
    }
    return { nodes, edges }
  }

  const total = levels.length

  return (
    <div className="border border-rule bg-panel">
      <div className="border-b border-rule bg-panel-head px-3.5 py-2">
        <span className="lbl">
          T(n) = {figure.branches}·T(n/{figure.divisor}) + n, com n = {figure.n}
        </span>
      </div>

      <Stepper
        autoPlay={autoPlay}
        count={total}
        labelFor={(k) => {
          const l = levels[k]!
          return `nível ${l.level}: ${l.calls} ${l.calls === 1 ? 'chamada' : 'chamadas'} × ${l.size} = ${l.cost}`
        }}
      >
        {(upTo) => {
          const { nodes, edges } = build(upTo)
          return (
            <div className="flex flex-col gap-0 md:flex-row">
              <div className="h-[260px] min-w-0 flex-1 border-b border-rule md:border-r md:border-b-0">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={false}
                  zoomOnScroll={false}
                  zoomOnPinch={false}
                  zoomOnDoubleClick={false}
                  preventScrolling={false}
                  fitView
                  fitViewOptions={{ padding: 0.14 }}
                  proOptions={{ hideAttribution: false }}
                >
                  <Background gap={18} size={1} color="var(--rule-soft)" />
                </ReactFlow>
              </div>

              {/* O equivalente textual, e ele é a mesma conta. */}
              <table className="w-full shrink-0 border-collapse text-left md:w-[300px]">
                <thead>
                  <tr>
                    {['nível', 'chamadas', 'tamanho', 'custo'].map((h) => (
                      <th key={h} className="lbl border-b border-rule px-2.5 py-1.5 font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {levels.slice(0, upTo + 1).map((l) => (
                    <tr key={l.level} className={l.level === upTo ? 'bg-contract-bg' : undefined}>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-3">{l.level}</td>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-2">{l.calls}</td>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-fg-2">{l.size}</td>
                      <td className="border-b border-rule-soft px-2.5 py-1 font-mono text-[12px] text-contract">{l.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </Stepper>

      <div className="border-t border-rule px-3.5 py-2 font-mono text-[11.5px] text-fg-3">
        {levels.length} níveis × {levels[0]!.cost} por nível ={' '}
        <span className="text-contract">{levels.length * levels[0]!.cost}</span>, e é daí que
        n log n sai
      </div>

      <p className="m-0 border-t border-rule px-3.5 py-2.5 text-[12.5px] leading-relaxed text-fg-3">
        {figure.caption}
      </p>
    </div>
  )
}
