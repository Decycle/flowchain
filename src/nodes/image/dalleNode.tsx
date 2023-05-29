import axios from 'axios'
import {
  NodeConfig,
  NodeComponent,
  AsyncNodeFunc,
  Labels,
  createNode,
} from '../../types'
import {
  NodeInputMissingError,
  OpenAIChatGPTRequestError,
} from '../../errors'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/lib/function'
import { log } from 'fp-ts/lib/Console'

const title = 'OpenAI DALLE'
const description = 'A node that connects to OpenAi DALLE-2'
const inputLabels = [
  {
    _tag: 'string',
    value: 'input_prompt',
  },
] as const satisfies Labels

const outputLabels = [
  {
    _tag: 'imageUrl',
    value: 'image',
  },
] as const satisfies Labels

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

const nodes = {
  dalle: createNode({
    config: {
      title,
      description,
      inputLabels,
      outputLabels,
      contentLabels: [],
      lazy: true,
    },
    afunc: ({ inputs }) =>
      pipe(
        inputs.input_prompt,
        TE.fromNullable(
          NodeInputMissingError.of('input_prompt')
        ),
        TE.map((input_prompt) => input_prompt.value),
        TE.map(getRequest),
        TE.chainFirstW(
          flow(
            (requestData) =>
              `Chatgpt Request: ${JSON.stringify(
                requestData
              )}`,
            log,
            TE.fromIO
          )
        ),
        TE.chainW((requestData) =>
          TE.tryCatch(
            () =>
              axios.post(openai_url, requestData, {
                headers,
              }),
            (reason) =>
              OpenAIChatGPTRequestError.of(String(reason))
          )
        ),
        TE.map((response) => {
          const response_data = {
            image: {
              _tag: 'imageUrl',
              value: response.data.data[0].url as string,
              image: 'a',
            } as const,
          }
          return response_data
        })
      ),
  }),
}

export default nodes
