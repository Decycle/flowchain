import chatGPTNode from './chatgptNode'
import promptNode from './promptNode'

const llmNodes = {
  ...chatGPTNode,
  ...promptNode,
}

export default llmNodes
