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
import { Content, Data, NodeConfig } from './types.ts'
import { v4 as uuidv4 } from 'uuid'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import {
  EdgeNotFoundError,
  NodeNotFoundError,
} from './nodes/errors'
import nodeConfigs from './nodes'
import { Lens } from 'monocle-ts'
import {
  arrayTraversal,
  nodeContentLens,
  nodeOutputLens,
} from './lens.ts'
import { pipe } from 'fp-ts/lib/function'
import { nodeDataLens, appNodesLens } from './lens.ts'

type DefaultNode = Node<NodeConfig>
type DefaultEdge = Edge

export type AppValue = {
  nodes: DefaultNode[]
  edges: DefaultEdge[]
}

export type NodeConfigsString = keyof typeof nodeConfigs

type AppActions = {
  addNode: (
    nodeType: NodeConfigsString,
    position?: XYPosition
  ) => string
  deleteNode: (
    nodeId: string
  ) => E.Either<NodeNotFoundError, void>
  getNodes: () => DefaultNode[]
  getNode: (nodeId: string) => O.Option<DefaultNode>

  updateNode: (
    nodeId: string,
    nodeUpdate: Partial<NodeConfig>
  ) => E.Either<NodeNotFoundError, void>

  setNodeOutput: (
    nodeId: string,
    output: Record<string, Data>,
    replace?: boolean
  ) => E.Either<NodeNotFoundError, void>

  setNodeContent: (
    nodeId: string,
    content: Record<string, Content>,
    replace?: boolean
  ) => E.Either<NodeNotFoundError, void>

  deleteEdge: (
    edgeId: string
  ) => E.Either<EdgeNotFoundError, void>
  getEdges: () => DefaultEdge[]
  getEdge: (edgeId: string) => O.Option<DefaultEdge>

  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
}

type AppState = AppValue & AppActions

const initialNodes: DefaultNode[] = []
const initialEdges: DefaultEdge[] = []

const useFlowStore = create<AppState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  addNode: (nodeType, position = { x: 0, y: 0 }) => {
    const id = uuidv4()
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          data: nodeConfigs[nodeType],
          position,
          id,
          type: 'baseNode',
        },
      ],
    }))
    return id
  },
  deleteNode: (nodeId) => {
    return pipe(
      get().nodes,
      A.findFirst((node) => node.id === nodeId),
      E.fromOption(() => new NodeNotFoundError(nodeId)),
      E.chain(() => {
        set((state) => ({
          nodes: state.nodes.filter(
            (node) => node.id !== nodeId
          ),
          edges: state.edges.filter(
            (edge) =>
              edge.source !== nodeId &&
              edge.target !== nodeId
          ),
        }))
        return E.right(undefined)
      })
    )
  },

  getNodes: () => get().nodes,
  getNode: (nodeId) => {
    return O.fromNullable(
      get().nodes.find((node) => node.id === nodeId)
    )
  },

  updateNode: (nodeId, nodeUpdate) => {
    const nodesUpdate = (nodeData: NodeConfig) => ({
      ...nodeData,
      ...nodeUpdate,
    })

    return pipe(
      get().nodes,
      A.findFirst((node) => node.id === nodeId),
      E.fromOption(() => new NodeNotFoundError(nodeId)),
      E.chain(() => {
        set(
          appNodesLens
            .composeTraversal(arrayTraversal<DefaultNode>())
            .filter((node) => node.id === nodeId)
            .composeLens(nodeDataLens)
            .modify(nodesUpdate)
        )
        return E.right(undefined)
      })
    )
  },

  setNodeOutput: (nodeId, output, replace) => {
    const nodesOutputUpdate = (
      nodeDataOutput: Record<string, Data>
    ): Record<string, Data> => ({
      ...nodeDataOutput,
      ...output,
    })

    const nodesOutputReplace = () => output

    return pipe(
      get().nodes,
      A.findFirst((node) => node.id === nodeId),
      E.fromOption(() => new NodeNotFoundError(nodeId)),
      E.chain(() => {
        set(
          appNodesLens
            .composeTraversal(arrayTraversal<DefaultNode>())
            .filter((node) => node.id === nodeId)
            .composeLens(nodeDataLens)
            .composeLens(nodeOutputLens)
            .modify((output) =>
              pipe(
                output ?? ({} as Record<string, Data>),
                replace
                  ? nodesOutputReplace
                  : nodesOutputUpdate
              )
            )
        )
        return E.right(undefined)
      })
    )
  },

  setNodeContent: (nodeId, content, replace) => {
    const nodesContentUpdate = (
      nodeDataOutput: Record<string, Content>
    ): Record<string, Data> => ({
      ...nodeDataOutput,
      ...content,
    })

    const nodesContentReplace = () => content

    return pipe(
      get().nodes,
      A.findFirst((node) => node.id === nodeId),
      E.fromOption(() => new NodeNotFoundError(nodeId)),
      E.chain(() => {
        set(
          appNodesLens
            .composeTraversal(arrayTraversal<DefaultNode>())
            .filter((node) => node.id === nodeId)
            .composeLens(nodeDataLens)
            .composeLens(nodeContentLens)
            .modify((output) =>
              pipe(
                output ?? ({} as Record<string, Content>),
                replace
                  ? nodesContentReplace
                  : nodesContentUpdate
              )
            )
        )
        return E.right(undefined)
      })
    )
  },

  deleteEdge: (edgeId) => {
    return pipe(
      get().edges,
      A.findFirst((edge) => edge.id === edgeId),
      E.fromOption(() => new EdgeNotFoundError(edgeId)),
      E.chain(() => {
        set((state) => ({
          edges: state.edges.filter(
            (edge) => edge.id !== edgeId
          ),
        }))
        return E.right(undefined)
      })
    )
  },

  getEdges: () => {
    return get().edges
  },
  getEdge: (edgeId) => {
    return O.fromNullable(
      get().edges.find((edge) => edge.id === edgeId)
    )
  },

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    })
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
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
}))

export type { AppState, DefaultNode }
export default useFlowStore
