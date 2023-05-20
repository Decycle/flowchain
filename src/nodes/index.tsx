import baseNodeTypes from './base'
import llmNodeTypes from './llm'
import imageNodeTypes from './image'
import functionNodeTypes from './functions'
import utilNodeTypes from './utils'

const nodeTypes = {
  ...baseNodeTypes,
  ...llmNodeTypes,
  ...imageNodeTypes,
  ...functionNodeTypes,
  ...utilNodeTypes,
}

export default nodeTypes
