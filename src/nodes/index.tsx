// import baseNodeTypes from './base'
// import llmNodeTypes from './llm'
// import imageNodeTypes from './image'
// import functionNodeTypes from './functions'
// import utilNodeTypes from './utils'

import OpenAiNode from './testNode'

// const nodeTypes = {
//   ...baseNodeTypes,
//   ...llmNodeTypes,
//   ...imageNodeTypes,
//   ...functionNodeTypes,
//   ...utilNodeTypes,
// }

// export default nodeTypes

const nodeConfigs = {
  'openai-chat': OpenAiNode,
}

export default nodeConfigs
