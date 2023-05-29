import axios from 'axios'
import {
  NodeConfig,
  Label,
  FunctionInput,
  NodeComponent,
  AsyncNodeFunc,
  Labels,
  createNode,
} from '../../types'
import {
  NodeInputMissingError,
  NodeInputTypeMismatchError,
  OpenAIChatGPTRequestError,
} from '../../errors'
import * as TE from 'fp-ts/TaskEither'
import { flow, pipe } from 'fp-ts/lib/function'
import { log } from 'fp-ts/lib/Console'

const title = 'OpenAI ChatGPT4'
const description =
  "A node that connects to OpenAI's ChatGPT 4"
const inputLabels = [
  {
    _tag: 'string',
    value: 'input_prompt',
  },
] as const satisfies Labels

const outputLabels = [
  {
    _tag: 'string',
    value: 'model_response',
  },
] as const satisfies Labels

const contentLabels = [] as const satisfies Labels

const open_ai_key =
  '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'

const openai_url =
  'https://api.openai.com/v1/chat/completions'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${open_ai_key}`,
}

const getRequest = (prompt: string) => ({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
})

const nodes = {
  chatgpt4: createNode({
    config: {
      title,
      description,
      inputLabels,
      outputLabels,
      contentLabels,
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
            model_response: {
              _tag: 'string',
              value: response.data.choices[0].message
                .content as string,
            } as const,
          }
          console.log('response_data', response_data)
          return response_data
        })
      ),
  }),
}

export default nodes
