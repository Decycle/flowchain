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
  XYPosition,
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
  currentId: number
  setCurrentId: (id: number) => void
  onNodesChange: OnNodesChange
  setNodes: (nodes: Node[]) => void
  addNode: (type: string, position: XYPosition) => void
  onEdgesChange: OnEdgesChange
  setEdges: (edges: Edge[]) => void
  onConnect: OnConnect
  onNodesDelete: (nodes: Node[]) => void

  setNodeUserValue: (id: string, value: any) => void
  setNodeDataValue: (id: string, value: any) => void
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  currentId: 0,
  setCurrentId: (id) => {
    set({
      currentId: id,
    })
  },
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
  addNode: (type: string, position: XYPosition) => {
    set((state) => {
      const newNode = {
        type,
        position,
        id: `${state.currentId}`,
        data: {
          userValues: {},
          dataValues: {},
        },
      }
      return {
        nodes: [...state.nodes, newNode],
        currentId: state.currentId + 1,
      }
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
    set((state) => {
      // remove existing edges connected to target
      const newEdges = state.edges.filter(
        (edge) =>
          edge.target !== params.target ||
          edge.targetHandle !== params.targetHandle
      )

      return {
        edges: addEdge(params, newEdges),
      }
    })
  },
  onNodesDelete: (nodes) => {
    console.log('delete nodes:', nodes)
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
