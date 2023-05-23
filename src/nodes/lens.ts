import { Lens } from 'monocle-ts'
import { AppValue, DefaultNode } from '../store'
import { NodeConfig } from './types'
import { fromTraversable } from 'monocle-ts'
import * as A from 'fp-ts/lib/Array'

export const appNodesLens =
  Lens.fromProp<AppValue>()('nodes')
export const nodeDataLens =
  Lens.fromProp<DefaultNode>()('data')

export const arrayTraversal = fromTraversable(A.Traversable)
