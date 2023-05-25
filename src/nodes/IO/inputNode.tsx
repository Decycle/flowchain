import { useState } from 'react'
import {
  allDataTypes,
  ComponentProps,
  Content,
  createNode,
  Labels,
} from '../../types'
import TextareaAutosize from 'react-textarea-autosize'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import { NodeContentMissingError } from '../errors'

const title = 'Input'
const description =
  'A node that sends inputs to other nodes'

const outputLabels = [
  {
    _tag: allDataTypes,
    value: 'input',
  },
] as const satisfies Labels

const contentLabels = [
  {
    _tag: allDataTypes,
    value: 'input',
  },
] as const satisfies Labels

const InputComponent = ({
  contents,
  setContents,
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
        <TextareaAutosize
          id='inputField'
          className='w-full p-2 border border-gray-300 rounded-md nodrag'
          value={contents.output?.value}
          onChange={(e) =>
            setContents({
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
          value={contents.output?.value}
          onChange={(e) =>
            setContents({
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

const nodes = {
  input: createNode({
    config: {
      title,
      description,
      inputLabels: [],
      outputLabels,
      contentLabels,
      contents: {
        input: {
          _tag: ['string', 'number', 'imageUrl'],
          value: '',
        },
      },
    },
    component: InputComponent,
    func: ({ contents }) => {
      console.log('running func', contents)
      return pipe(
        contents.input,
        E.fromNullable(
          NodeContentMissingError.of('output')
        ),
        E.map((output) => ({
          input: {
            _tag: ['string', 'number', 'imageUrl'],
            value: output.value,
          } as const,
        }))
      )
    },
  }),
}

export default nodes
