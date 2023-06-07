import IONodes from './IO'
import LLMNodes from './llm'
import imageNodes from './image'

const nodeComponents = {
  ...IONodes,
  ...LLMNodes,
  ...imageNodes,
}

export type AllNodeComponentType = typeof nodeComponents
export type AllNodeConfigType = {
  [K in keyof AllNodeComponentType]: AllNodeComponentType[K]['config']
}[keyof AllNodeComponentType]

export default nodeComponents
