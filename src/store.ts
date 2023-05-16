import {
  addEdge,
  Node,
  Edge,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  applyNodeChanges,
  applyEdgeChanges,
  EdgeChange,
} from 'reactflow'

import 'reactflow/dist/style.css'
import { create } from 'zustand'

type NodeValue = {
  [key: string]: any
}

type AppState = {
  nodes: Node[]
  nodeValues: { [key: string]: NodeValue }
  edges: Edge[]
  onNodesChange: OnNodesChange
  setNodes: (nodes: Node[]) => void
  setNodeValues: (nodeValues: {
    [key: string]: NodeValue
  }) => void
  onEdgesChange: OnEdgesChange
  setEdges: (edges: Edge[]) => void
  onConnect: OnConnect
  setNodeValue: (id: string, value: any) => void
  updateNodeEdgeId: (
    nodeId: string,
    oldEdgeType: 'target' | 'source',
    oldEdgeId: string,
    newEdgeId: string
  ) => void
}

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 300, y: 300 },
    type: 'inputNode',
    data: {},
  },
  {
    id: '2',
    position: { x: 600, y: 300 },
    type: 'promptNode',
    data: {
      prompt: 'It is {current_time}, What is your name?',
    },
  },
  {
    id: '3',
    position: { x: 600, y: 400 },
    type: 'promptNode',
    data: {
      prompt: 'It is {current_time}, What is your name?',
    },
  },
  {
    id: '4',
    position: { x: 500, y: 300 },
    type: 'openAiNode',
    data: {},
  },
  {
    id: '5',
    position: { x: 400, y: 300 },
    type: 'openAiNode',
    data: {},
  },
  {
    id: '6',
    position: { x: 1100, y: 300 },
    type: 'outputNode',
    data: {},
  },
]
const initialEdges: Edge[] = [
  //   {
  //     id: 'e1-2',
  //     source: '1',
  //     target: '3',
  //     targetHandle: 'output',
  //   },
]

const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  nodeValues: {},
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },
  setNodes: (nodes) => {
    set({
      nodes,
    })
  },
  setNodeValues: (nodeValues) => {
    set({
      nodeValues,
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    })
  },
  setEdges: (edges) => {
    set({
      edges,
    })
  },
  onConnect: (params) => {
    set((state) => ({
      edges: addEdge(params, state.edges),
    }))
  },
  setNodeValue: (id, value) => {
    set((state) => ({
      nodeValues: {
        ...state.nodeValues,
        [id]: value,
      },
    }))
  },
  updateNodeEdgeId: (
    nodeId,
    oldEdgeType,
    oldEdgeId,
    newEdgeId
  ) => {
    set((state) => {
      const newEdges = state.edges.map((edge) => {
        if (
          edge.target === nodeId &&
          edge.id === oldEdgeId
        ) {
          return {
            ...edge,
            targetHandle: newEdgeId,
          }
        }
        return edge
      })

      return {
        edges: newEdges,
      }
    })
  },
}))

export type { AppState }
export default useFlowStore
