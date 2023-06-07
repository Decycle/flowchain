import { useState } from 'react'
import { createNode, Labels } from '../../types'
import TextareaAutosize from 'react-textarea-autosize'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/lib/function'
import { NodeContentMissingError } from '../../errors'

const title = 'Input'
const description =
  'A node that sends inputs to other nodes'

const inputLabels = [] as const satisfies Labels

const outputLabels: readonly [
  {
    _tag: 'string' | 'number' | 'imageUrl'
    value: 'input'
  }
] = [
  {
    _tag: 'string',
    value: 'input',
  },
] as const satisfies Labels

const contentLabels: readonly [
  {
    _tag: 'string' | 'number' | 'imageUrl'
    value: 'input'
  }
] = [
  {
    _tag: 'string',
    value: 'input',
  },
] as const satisfies Labels

const nodes = {
  input: createNode({
    config: {
      title,
      description,
      inputLabels,
      outputLabels,
      contentLabels,
      contents: {
        input: {
          _tag: 'string',
          value: '',
        },
      },
    },
    Component: ({ contents, setContents }) => {
      const inputTypeOptions = ['string', 'number'] as const
      const [inputType, setInputType] = useState<
        'string' | 'number'
      >('string')

      return (
        <div className='w-full'>
          <label
            htmlFor='inputTypeSelect'
            className='block text-sm font-semibold mb-1'>
            Input Type
          </label>
          <select
            id='inputTypeSelect'
            value={inputType}
            onChange={(e) => {
              if (
                e.target.value === 'string' ||
                e.target.value === 'number'
              ) {
                setInputType(e.target.value)
              }
            }}
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
          {inputType === 'string' ? (
            <TextareaAutosize
              id='inputField'
              className='w-full p-2 border border-gray-300 rounded-md nodrag max-h-96'
              value={contents.input?.value}
              onChange={(e) =>
                setContents({
                  input: {
                    _tag: inputType,
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
              value={contents.input?.value}
              onChange={(e) =>
                setContents({
                  input: {
                    _tag: inputType,
                    value: parseFloat(e.target.value),
                  },
                })
              }
            />
          )}
        </div>
      )
    },
    func: ({ contents }) =>
      pipe(
        contents.input,
        E.fromNullable(
          NodeContentMissingError.of('output')
        ),
        E.map((output) => ({
          input: {
            ...output,
          } as const,
        }))
      ),
  }),
}

export default nodes
