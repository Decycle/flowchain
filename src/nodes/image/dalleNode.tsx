import axios from 'axios'
import {
  NodeConfig,
  Label,
  StringData,
  FunctionInput,
  ImageUrlData,
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

const title = 'OpenAI DALLE'
const description = 'A node that connects to OpenAi DALLE-2'
const inputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'input_prompt',
  },
]

const outputLabels: Label[] = [
  {
    _tag: 'imageUrl',
    value: 'image',
  },
]

const open_ai_key =
  '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'

const openai_url =
  'https://api.openai.com/v1/images/generations'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${open_ai_key}`,
}

const getRequest = (prompt: string) => ({
  prompt,
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
          _tag: 'imageUrl',
          value: response.data.data[0].url as string,
        } as ImageUrlData,
      }
      console.log('response_data', response_data)
      return response_data
    })
  )

const dalleNodeConfig: NodeConfig = {
  title,
  description,
  inputLabels,
  outputLabels,
  lazy: true,
}

const dalleNode: NodeComponent = {
  config: dalleNodeConfig,
  afunc,
}

const nodes = {
  dalle: dalleNode,
}

export default nodes
