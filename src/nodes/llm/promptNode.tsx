import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import GenericNode, { NodeFunc } from '../base/genericNode'
import useFlowStore from '../../store'

type NodeProps = {
  id: string
}

const title = 'Prompt'
const description =
  'A node that outputs a prompt, pass in variables with {variable}'
const outputLabels = ['prompt']

const PromptNode = ({ id }: NodeProps) => {
  const [labels, setLabels] = useState<string[]>([])

  const [value, setValue, setNodeDataValue] = useFlowStore(
    (state) => {
      const value =
        state.nodes.find((node) => node.id === id)?.data
          .userValues?.template ?? ''

      const setValue = (id: string, value: string) => {
        state.setNodeUserValue(id, { template: value })
        state.setNodeDataValue(id, { prompt: value })
      }

      return [value, setValue, state.setNodeDataValue]
    }
  )

  useEffect(() => {
    const rawMatches = value.match(/{[^}]+}/g) ?? []
    const matches = rawMatches
      .map((s: string) => s.slice(1, -1).trim())
      .filter((s: string) => s.length > 0)
    setLabels(Array.from(new Set(matches)))
    if (matches.length === 0) {
      setNodeDataValue(id, { prompt: value })
    }
  }, [id, value, setNodeDataValue])

  const func: NodeFunc = useCallback(
    (inputs) => {
      let output = value

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
    [labels, value]
  )

  return (
    <GenericNode
      id={id}
      data={{
        title,
        description,
        inputLabels: labels,
        outputLabels,
        func,
      }}>
      <textarea
        value={value}
        onChange={(e) => setValue(id, e.target.value)}
        className='w-full p-2 border border-gray-300 rounded-md mb-4 nodrag'
      />
    </GenericNode>
  )
}

export default PromptNode
