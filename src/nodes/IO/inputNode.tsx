import { useState } from 'react'
import {
  NodeConfig,
  Label,
  FunctionInput,
  ComponentProps,
  StringData,
  Content,
  Data,
  NodeComponent,
  NodeFunc,
  createNode,
  StringLabel,
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
    _tag: 'string',
    value: 'input',
  },
] as const satisfies ReadonlyArray<Label>

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

type outputType = typeof outputLabels

const nodes = {
  input: createNode<StringLabel[], outputType>({
    config: {
      title,
      description,
      inputLabels: [],
      outputLabels,
      contents: {
        output: {
          _tag: 'string',
          value: '',
        } as StringData,
      },
    },
    component: InputComponent,
    func: ({ contents }) => {
      console.log('running func', contents)
      return pipe(
        contents.output,
        E.fromNullable(
          NodeContentMissingError.of('output')
        ),
        E.map((output: Content) => ({
          input: {
            _tag: output._tag,
            value: output.value,
          },
        }))
      )
    },
  }),
}

export default nodes
