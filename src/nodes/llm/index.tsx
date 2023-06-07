import chatGPTNode from './chatgptNode'
import chatGPT4Node from './chatgpt4Node'
import promptNode from './promptNode'
import dynamicPromptNode from './dynamicPromptNode'

const llmNodes = {
  ...chatGPTNode,
  ...chatGPT4Node,
  ...promptNode,
  ...dynamicPromptNode,
}

export default llmNodes
