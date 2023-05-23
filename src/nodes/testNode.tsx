import axios from 'axios'
import { AsyncNodeFunc, NodeConfig, Label } from './types'
import {
  NodeInputMissingError,
  OpenAIChatGPTRequestError,
} from './errors'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/lib/function'
import { log } from 'fp-ts/lib/Console'
import * as E from 'fp-ts/lib/Either'

const title = 'OpenAI'
const description = 'A node that connects to OpenAi'
const inputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'input_prompt',
  },
]

type Inputs = {
  input_prompt?: string
}

const outputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'model_response',
  },
]

type Outputs = {
  model_response: string
}

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

const afunc = ({ input_prompt }: Inputs) =>
  pipe(
    input_prompt,
    TE.fromNullable(
      NodeInputMissingError.of('input_prompt')
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
    TE.map((response) => ({
      model_response: response.data.choices[0]
        .message as string,
    }))
  )

const OpenAiNode: NodeConfig = {
  title,
  description,
  inputLabels,
  outputLabels,
  afunc,
}

export default OpenAiNode
