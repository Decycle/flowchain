import { useState } from 'react'
import {
  NodeConfig,
  Label,
  FunctionInput,
  ComponentProps,
  StringData,
} from '../../types'
import * as E from 'fp-ts/Either'

const title = 'Input'
const description =
  'A node that sends inputs to other nodes'

const outputLabels: Label[] = [
  {
    _tag: 'string',
    value: 'input',
  },
]

const func = ({ content }: FunctionInput) => {
  return E.right({
    input: {
      _tag: 'string',
      value: content.output?.value,
    } as StringData,
  })
}

const InputComponent = ({
  content,
  setContent,
}: ComponentProps) => {
  const inputTypeOptions = ['text', 'number']
  const [inputType, setInputType] = useState<
    'text' | 'number'
  >('text')

  return (
    <div>
      <label
        htmlFor='inputTypeSelect'
        className='block text-sm font-semibold mb-1'>
        Input Type
      </label>
      <select
        id='inputTypeSelect'
        value={inputType}
        onChange={(e) =>
          setInputType(e.target.value as 'text' | 'number')
        }
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
      {inputType === 'text' ? (
        <textarea
          id='inputField'
          className='w-full p-2 border border-gray-300 rounded-md nodrag'
          value={content.output?.value}
          onChange={(e) =>
            setContent({
              output: {
                _tag: 'string',
                value: e.target.value,
              },
            })
          }
        />
      ) : (
        <input
          id='inputField'
          type={inputType}
          className='w-full p-2 border border-gray-300 rounded-md nodrag'
          value={content.output?.value}
          onChange={(e) =>
            setContent({
              output: {
                _tag: 'string',
                value: e.target.value,
              },
            })
          }
        />
      )}
    </div>
  )
}

const InputNode: NodeConfig = {
  title,
  description,
  inputLabels: [],
  outputLabels,
  func,
  Component: InputComponent,
}

export default InputNode
