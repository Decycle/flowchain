import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import GenericNode, {
  AsyncNodeFunc,
  NodeFunc,
} from '../base/genericNode'
import axios from 'axios'

type NodeProps = {
  id: string
}

const title = 'OpenAI DALLE'
const description = 'A node that connects to OpenAi DALLE-2'
const inputLabels = ['input_prompt']
const outputLabels = ['image']

const DalleNode = ({ id }: NodeProps) => {
  const afunc: AsyncNodeFunc = useCallback(
    async (inputs) => {
      const input_prompt = inputs['input_prompt']

      const open_ai_key =
        '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'

      const openai_url =
        'https://api.openai.com/v1/images/generations'

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${open_ai_key}`,
      }

      const requestData = {
        prompt: input_prompt,
      }

      console.log(requestData)

      const response = await axios.post(
        openai_url,
        requestData,
        { headers }
      )

      const imageUrl = response.data.data[0].url

      return { image: imageUrl }
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

export default DalleNode
