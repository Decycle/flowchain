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
import { create, useStore } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Contents,
  Datas,
  Labels,
  AnyNodeConfigType,
} from './types.ts'
import { v4 as uuidv4 } from 'uuid'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import {
  EdgeNotFoundError,
  NodeNotFoundError,
} from './errors.tsx'
import nodeComponents from './nodes'
import { Lens } from 'monocle-ts'
import {
  arrayTraversal,
  nodeContentLens,
  nodeInputLabelsLens,
  nodeOutputLabelsLens,
  nodeOutputLens,
} from './lens.ts'
import { pipe } from 'fp-ts/lib/function'
import { nodeDataLens, appNodesLens } from './lens.ts'

type DefaultNode = Node<AnyNodeConfigType>
type DefaultEdge = Edge

export type AppValue = {
  nodes: DefaultNode[]
  edges: DefaultEdge[]
}

export type NodeConfigsString = keyof typeof nodeComponents

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
    nodeUpdate: Partial<AnyNodeConfigType>
  ) => E.Either<NodeNotFoundError, void>

  setNodeOutputs: (
    nodeId: string,
    outputs: Datas,
    replace?: boolean
  ) => E.Either<NodeNotFoundError, void>

  setNodeContents: (
    nodeId: string,
    contents: Contents,
    replace?: boolean
  ) => E.Either<NodeNotFoundError, void>

  setNodeInputLabels: (
    nodeId: string,
    labels: Labels
  ) => E.Either<NodeNotFoundError, void>

  setNodeOutputLabels: (
    nodeId: string,
    labels: Labels
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

type AppState = AppValue & AppActions // ^?

const initialNodes: DefaultNode[] = []
const initialEdges: DefaultEdge[] = []

const setNodeProperty = <A>(
  nodeId: string,
  lens: Lens<AnyNodeConfigType, A>,
  content: A,
  get: () => AppState,
  set: (
    partial: (state: AppState) => Partial<AppState>
  ) => void,
  replace?: boolean
) => {
  const nodesContentUpdate = (nodeDataOutput: A): A => {
    //if content is object, merge with existing content

    if (
      typeof content === 'object' &&
      !Array.isArray(content)
    ) {
      return {
        ...nodeDataOutput,
        ...content,
      } as A
    }
    //else replace content
    return content
  }

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
          .composeLens(lens)
          .modify((output) =>
            pipe(
              output ?? ({} as A),
              replace
                ? nodesContentReplace
                : nodesContentUpdate
            )
          )
      )
      return E.right(undefined)
    })
  )
}

const flowStore = (
  set: (
    partial:
      | AppState
      | Partial<AppState>
      | ((state: AppState) => AppState | Partial<AppState>),
    replace?: boolean | undefined
  ) => void,
  get: () => AppState
): AppState => ({
  nodes: initialNodes,
  edges: initialEdges,

  addNode: (nodeType, position = { x: 0, y: 0 }) => {
    const id = uuidv4()
    const nodeComponent = nodeComponents[nodeType]

    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          data: {
            ...nodeComponent.config,
            componentId: nodeType,
          },
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
    const nodesUpdate = (
      nodeData: AnyNodeConfigType
    ): AnyNodeConfigType => ({
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

  setNodeOutputs: (nodeId, outputs, replace) =>
    setNodeProperty(
      nodeId,
      nodeOutputLens,
      outputs,
      get,
      set,
      replace
    ),

  setNodeContents: (nodeId, contents, replace) =>
    setNodeProperty(
      nodeId,
      nodeContentLens,
      contents,
      get,
      set,
      replace
    ),

  setNodeInputLabels: (nodeId, labels) =>
    setNodeProperty(
      nodeId,
      nodeInputLabelsLens,
      labels,
      get,
      set
    ),

  setNodeOutputLabels: (nodeId, labels) =>
    setNodeProperty(
      nodeId,
      nodeOutputLabelsLens,
      labels,
      get,
      set
    ),

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
})

const useFlowStore = create(
  persist(flowStore, {
    name: 'flow-store',
  })
)

export type { AppState, DefaultNode }
export default useFlowStore
