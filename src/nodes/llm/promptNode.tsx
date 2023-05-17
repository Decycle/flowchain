import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import GenericNode, { NodeFunc } from '../base/genericNode'
import useFlowStore from '../../store'

type NodeData = {
  prompt?: string
}
type NodeProps = {
  id: string
  data: NodeData
}

const PromptNode = ({ data, id }: NodeProps) => {
  const [inputValue, setInputValue] = useState(
    data.prompt ?? ''
  )
  const [labels, setLabels] = useState<string[]>([])

  const title = 'Prompt'
  const description =
    'A node that outputs a prompt, pass in variables with {variable}'
  const outputLabels = ['prompt']

  const updateNodeEdgeId = useFlowStore(
    (state) => state.updateNodeEdgeId
  )
  const setNodeValue = useFlowStore(
    (state) => state.setNodeValue
  )

  useEffect(() => {
    const rawMatches = inputValue.match(/{[^}]+}/g) ?? []
    const matches = rawMatches
      .map((s) => s.slice(1, -1).trim())
      .filter((s) => s.length > 0)
    setLabels(Array.from(new Set(matches)))
    if (matches.length === 0) {
      setNodeValue(id, { prompt: inputValue })
    }
  }, [id, inputValue, setNodeValue])

  const func: NodeFunc<string, string> = useCallback(
    (inputs) => {
      let output = inputValue

      for (const label of labels) {
        if (inputs[label] == null) {
          return { prompt: '' }
        }
        //replace all instances of {label} with the input value
        output = output.replace(
          new RegExp(`{${label}}`, 'g'),
          inputs[label]
        )
      }

      return { prompt: output }
    },
    [labels, inputValue]
  )

  return (
    <GenericNode
      data={{
        title,
        description,
        inputLabels: labels,
        outputLabels,
        func,
      }}
      id={id}>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className='w-full p-2 border border-gray-300 rounded-md mb-4 nodrag'
      />
    </GenericNode>
  )
}

export default PromptNode
