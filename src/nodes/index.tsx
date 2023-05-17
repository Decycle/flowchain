import baseNodeTypes from './base'
import llmNodeTypes from './llm'
import imageNodeTypes from './image'

const nodeTypes = {
  ...baseNodeTypes,
  ...llmNodeTypes,
  ...imageNodeTypes,
}

export default nodeTypes
