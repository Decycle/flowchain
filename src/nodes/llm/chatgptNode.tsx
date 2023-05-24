import axios from 'axios'
import {
  NodeConfig,
  Label,
  StringData,
  FunctionInput,
  NodeComponent,
} from '../../types'
import {
  NodeInputMissingError,
  NodeInputTypeMismatchError,
  OpenAIChatGPTRequestError,
} from '../errors'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/lib/function'
import { log } from 'fp-ts/lib/Console'

const title = 'OpenAI'
const description = 'A node that connects to OpenAi'
const inputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'input_prompt',
  },
]

const outputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'model_response',
  },
]

const open_ai_key =
  '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'

const openai_url =
  'https://api.openai.com/v1/chat/completions'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${open_ai_key}`,
}

const getRequest = (prompt: string) => ({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: prompt }],
})

const afunc = ({ inputs }: FunctionInput) =>
  pipe(
    inputs.input_prompt,
    TE.fromNullable(
      NodeInputMissingError.of('input_prompt')
    ),
    TE.chainW((input_prompt) =>
      input_prompt._tag === 'string'
        ? TE.right(input_prompt.value)
        : TE.left(
            NodeInputTypeMismatchError.of(
              'input_prompt',
              'string',
              input_prompt._tag
            )
          )
    ),
    TE.map(getRequest),
    TE.chainFirstW(
      flow(
        (requestData) =>
          `Chatgpt Request: ${JSON.stringify(requestData)}`,
        log,
        TE.fromIO
      )
    ),
    TE.chainW((requestData) =>
      TE.tryCatch(
        () =>
          axios.post(openai_url, requestData, { headers }),
        (reason) =>
          OpenAIChatGPTRequestError.of(String(reason))
      )
    ),
    TE.map((response) => {
      const response_data = {
        model_response: {
          _tag: 'string',
          value: response.data.choices[0].message
            .content as string,
        } as StringData,
      }
      console.log('response_data', response_data)
      return response_data
    })
  )

const chatGPTNodeConfig: NodeConfig = {
  title,
  description,
  inputLabels,
  outputLabels,
  lazy: true,
}

const chatGPTNode: NodeComponent = {
  config: chatGPTNodeConfig,
  afunc,
}

const nodes = {
  chatgpt: chatGPTNode,
}

export default nodes
