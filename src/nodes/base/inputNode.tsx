import React, { memo, useEffect } from 'react'
import { useCallback } from 'react'
import { Handle, Position, Node } from 'reactflow'
import getHandleColor from './utils'
import GenericNode from './genericNode'
import useFlowStore from '../../store'

type NodeData = {
  runFunc: () => void
}
type NodeDataProps = {
  id: string
  data: NodeData
}

const InputNode = ({ id }: NodeDataProps) => {
  const [inputType, setInputType] = React.useState('text')
  const inputTypeOptions = ['text', 'number', 'image']

  const [inputValue, setInputValue] = React.useState('')

  const title = 'Input'
  const description = 'Input value for this chain'

  const setNodeValue = useFlowStore(
    (state) => state.setNodeValue
  )

  useEffect(() => {
    setNodeValue(id, { value: inputValue })
  }, [id, setNodeValue, inputValue])

  return (
    <GenericNode
      id={id}
      data={{
        title,
        description,
        outputLabels: ['value'],
      }}>
      <label
        htmlFor='inputTypeSelect'
        className='block text-sm font-semibold mb-1'>
        Input Type
      </label>
      <select
        id='inputTypeSelect'
        value={inputType}
        onChange={(e) => setInputType(e.target.value)}
        className='mb-4 w-full p-2 border border-gray-300 rounded-md'>
        {inputTypeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <label
        htmlFor='inputField'
        className='block text-sm font-semibold mb-1'>
        Value:
      </label>
      <input
        id='inputField'
        type={inputType}
        className='w-full p-2 border border-gray-300 rounded-md'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
    </GenericNode>
  )
}

export default InputNode
