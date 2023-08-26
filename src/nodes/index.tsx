import IONodes from './IO'
import LLMNodes from './llm'
import imageNodes from './image'
import functionNodes from './functions'

const nodeComponents = {
  ...IONodes,
  ...LLMNodes,
  ...imageNodes,
  ...functionNodes,
}

export type AllNodeComponentType = typeof nodeComponents
export type AllNodeConfigType = {
  [K in keyof AllNodeComponentType]: AllNodeComponentType[K]['config']
}[keyof AllNodeComponentType]

export default nodeComponents
