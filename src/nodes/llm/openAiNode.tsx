import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import GenericNode, {
  AsyncNodeFunc,
  NodeFunc,
} from '../base/genericNode'
import axios from 'axios'

type NodeData = {
  prompt?: string
}
type NodeProps = {
  id: string
  data: NodeData
}

const OpenAiNode = ({ data, id }: NodeProps) => {
  const title = 'OpenAI'
  const description = 'A node that connects to OpenAi'
  const inputLabels = ['input_prompt']
  const outputLabels = ['model_response']

  const afunc: AsyncNodeFunc<string, string> = useCallback(
    async (inputs) => {
      const input_prompt = inputs['input_prompt']

      const open_ai_key =
        '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'

      const openai_url =
        'https://api.openai.com/v1/chat/completions'

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${open_ai_key}`,
      }

      const requestData = {
        model: 'gpt-3.5-turbo',

        messages: [{ role: 'user', content: input_prompt }],
      }

      console.log(requestData)

      const response = await axios.post(
        openai_url,
        requestData,
        { headers }
      )

      const output =
        response.data.choices[0].message.content

      return { model_response: output }
    },
    []
  )

  return (
    <GenericNode
      data={{
        title,
        description,
        inputLabels,
        outputLabels,
        afunc,
      }}
      id={id}
      lazy></GenericNode>
  )
}

export default OpenAiNode
