import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import GenericNode, { NodeFunc } from '../base/genericNode'
import useFlowStore from '../../store'

import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-dracula'

type NodeProps = {
  id: string
  lazy?: boolean
}

const description =
  'Lets you run a custom javascript function (fast updates)'
const outputLabels = ['result']

const BaseFunctionNode = ({ id, lazy }: NodeProps) => {
  const [title, setTitle] = useState('Function')
  const [labels, setLabels] = useState<string[]>([])

  const [value, setValue, setNodeDataValue] = useFlowStore(
    (state) => {
      const value =
        state.nodes.find((node) => node.id === id)?.data
          .userValues?.function ?? ''

      const setValue = (id: string, value: string) => {
        state.setNodeUserValue(id, { function: value })
      }

      return [value, setValue, state.setNodeDataValue]
    }
  )

  const [customFunc, setCustomFunc] = useState<any>(null)

  const compileFunction = useEffect(() => {
    console.log('compiling function')

    const getArgs = (raw_string: string) => {
      const argPattern = /function\s(.*)\(([^)]*)\)/ // Regular expression pattern
      const matches = raw_string.match(argPattern) // Get array with matched strings

      if (matches) {
        const name = matches[1].trim() // Get first matched substring
        const args = matches[2] // Get first matched substring
          .split(',') // Split arguments in the form 'arg1, arg2, arg3'
          .map((arg: string) => arg.trim()) // Trim whitespace around each argument
          .filter((arg: string) => arg) // Remove empty ones

        return [name, args] as [string, string[]]
      }
      return [null, []] as [null, string[]]
    }

    const getBody = (raw_string: string) => {
      const bodyPattern = /{([\s\S]*)}/ // Regular expression pattern
      const body = raw_string.match(bodyPattern)?.[1] // Get array with matched strings
      return body
    }

    const [name, args] = getArgs(value)
    const body = getBody(value)

    if (!body) {
      return
    }

    try {
      const func = new Function(...args, body)
      if (name) {
        const title =
          name.charAt(0).toUpperCase() + name.slice(1)
        setTitle(title)
      }
      setLabels(args)
      setCustomFunc(() => func)
    } catch (e) {
      console.error(e)
    }
  }, [value])

  const func = useCallback<NodeFunc>(
    (inputs) => {
      console.log('inputs', inputs)
      console.log('labels', labels)
      console.log('customFunc', customFunc)
      for (const key of labels) {
        if (inputs[key] === null) {
          return {}
        }
      }

      if (!customFunc) {
        console.error('no custom func')
        return {}
      }

      try {
        const result = customFunc(
          ...labels.map((key) => inputs[key])
        )
        return { result }
      } catch (e) {
        console.error(e)
        return {}
      }
    },
    [labels, customFunc]
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
      id={id}
      lazy={lazy}>
      <AceEditor
        value={value}
        height='200px'
        mode='javascript'
        theme='dracula'
        onChange={(e) => setValue(id, e)}
        className='w-full p-2 rounded-md mb-4 nodrag'
        placeholder='function(a, b) { return a + b }'
      />
    </GenericNode>
  )
}

const FunctionNode = ({ id }: NodeProps) => {
  return <BaseFunctionNode id={id} lazy={false} />
}

const LazyFunctionNode = ({ id }: NodeProps) => {
  return <BaseFunctionNode id={id} lazy={true} />
}

export { FunctionNode, LazyFunctionNode }
export default BaseFunctionNode
