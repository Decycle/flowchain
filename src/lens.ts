import { Lens } from 'monocle-ts'
import { AppValue, DefaultNode } from './store'
import { Data, NodeConfig } from './types'
import { fromTraversable } from 'monocle-ts'
import * as A from 'fp-ts/lib/Array'

export const appNodesLens =
  Lens.fromProp<AppValue>()('nodes')
export const nodeDataLens =
  Lens.fromProp<DefaultNode>()('data')
export const nodeOutputLens =
  Lens.fromProp<NodeConfig>()('outputs')
export const nodeContentLens =
  Lens.fromProp<NodeConfig>()('contents')
export const nodeInputLabelsLens =
  Lens.fromProp<NodeConfig>()('inputLabels')
export const nodeOutputLabelsLens =
  Lens.fromProp<NodeConfig>()('outputLabels')

export const arrayTraversal = fromTraversable(A.Traversable)
