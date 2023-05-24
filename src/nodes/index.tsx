import IONodes from './IO'
import LLMNodes from './llm'
import imageNodes from './image'

const nodeComponents = {
  ...IONodes,
  ...LLMNodes,
  ...imageNodes,
}

export default nodeComponents
