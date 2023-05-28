import { Lens } from 'monocle-ts'
import { AppValue, DefaultNode } from './store'
import { fromTraversable } from 'monocle-ts'
import * as A from 'fp-ts/lib/Array'
import { AnyNodeConfigType } from './types'

export const appNodesLens =
  Lens.fromProp<AppValue>()('nodes')
export const nodeDataLens =
  Lens.fromProp<DefaultNode>()('data')
export const nodeOutputLens =
  Lens.fromProp<AnyNodeConfigType>()('outputs')
export const nodeContentLens =
  Lens.fromProp<AnyNodeConfigType>()('contents')
export const nodeInputLabelsLens =
  Lens.fromProp<AnyNodeConfigType>()('inputLabels')
export const nodeOutputLabelsLens =
  Lens.fromProp<AnyNodeConfigType>()('outputLabels')

export const arrayTraversal = fromTraversable(A.Traversable)
