// import baseNodeTypes from './base'
// import llmNodeTypes from './llm'
// import imageNodeTypes from './image'
// import functionNodeTypes from './functions'
// import utilNodeTypes from './utils'

import IONodeConfigs from './IO'
import LLMNodeConfigs from './llm'
import imageNodeConfigs from './image'
// const nodeTypes = {
//   ...baseNodeTypes,
//   ...llmNodeTypes,
//   ...imageNodeTypes,
//   ...functionNodeTypes,
//   ...utilNodeTypes,
// }

// export default nodeTypes

const nodeConfigs = {
  ...IONodeConfigs,
  ...LLMNodeConfigs,
  ...imageNodeConfigs,
}

export default nodeConfigs
