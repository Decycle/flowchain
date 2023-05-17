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

interface NodeData {
  userValues: {
    [key: string]: any
  }
  dataValues: {
    [key: string]: any
  }
}

type DefaultNode = Node<NodeData>

type AppState = {
  nodes: DefaultNode[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  setNodes: (nodes: Node[]) => void
  onEdgesChange: OnEdgesChange
  setEdges: (edges: Edge[]) => void
  onConnect: OnConnect

  setNodeUserValue: (id: string, value: any) => void
  setNodeDataValue: (id: string, value: any) => void
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
  {
    id: '7',
    position: { x: 1100, y: 300 },
    type: 'inputNode',
    data: {},
  },
  {
    id: '8',
    position: { x: 1100, y: 300 },
    type: 'inputNode',
    data: {},
  },
  {
    id: '9',
    position: { x: 1100, y: 300 },
    type: 'dalleNode',
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
  setNodeUserValue: (id, value) => {
    set((state) => {
      return {
        nodes: state.nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                userValues: {
                  ...node.data.userValues,
                  ...value,
                },
              },
            }
          } else {
            return node
          }
        }),
      }
    })
  },
  setNodeDataValue: (id, value) => {
    set((state) => {
      return {
        nodes: state.nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                dataValues: {
                  ...node.data.dataValues,
                  ...value,
                },
              },
            }
          } else {
            return node
          }
        }),
      }
    })
  },
}))

export type { AppState, DefaultNode }
export default useFlowStore
