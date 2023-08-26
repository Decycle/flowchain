import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import { Labels, createNode } from '../../types'
import * as E from 'fp-ts/Either'

import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-dracula'
import { pipe } from 'fp-ts/lib/function'

const title = 'Function'
const description =
  'Lets you run a custom javascript function'

const inputLabels: ReadonlyArray<{
  _tag: 'string'
  value: string
}> = [] as const

const outputLabels = [
  {
    _tag: 'string',
    value: 'result',
  },
] as const satisfies Labels

const contentLabels = [
  {
    _tag: 'string',
    value: 'function',
  },
] as const satisfies Labels

const getArgs = (raw_string: string) => {
    const argPattern = /function\s?(.*)\(([^)]*)\)/ // Regular expression pattern
    const matches = raw_string.match(argPattern) // Get array with matched strings

    // console.log("raw_string", raw_string)
    // console.log("matches", matches)
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

const node = {
    function: createNode({
        config: {
            title,
            description,
            inputLabels,
            outputLabels,
            contentLabels,
            // lazy: true,
        },
        func: ({ inputs, contents }) => {
            // console.log('inputs', inputs)

            const [name, args] = getArgs(contents.function?.value ?? '')
            const body = getBody(contents.function?.value ?? '')

            const customFunc = pipe(
                E.fromNullable(new Error("no function body"))(body),
                E.chainW((body) =>
                    E.tryCatch(
                        () => new Function(...args, body),
                        (reason) => new Error(String(reason))
                )),
            )
            // if (E.isRight(customFunc)) {
            //     console.log('customFunc', customFunc.right({a: 1}))
            // }

            const result = pipe(
                customFunc,
                E.chain((func) => {
                    for (const key of args) {
                        if (inputs[key] === null) {
                            return E.left(new Error(`missing input ${key}`))
                        }
                    }
                    return E.right(func)
                }),
                E.chain((func) =>
                    E.tryCatch(
                        () => func(...args.map((key) => inputs[key]?.value)),
                        (reason) => new Error(String(reason))
                    ),
                ),
                E.map((result) => ({
                    result: {
                        _tag: "string",
                        value: result.toString()
                    } as const
                }))
            )

            console.log("inputs", inputs)
            console.log("contents", contents)
            console.log("result", result)

            return result
        },
        Component: ({ contents, setContents }) => {

            // console.log('contents', contents)
            return  <AceEditor
            value={contents.function?.value.toString() ?? ''}
            height='200px'
            mode='javascript'
            theme='dracula'
            onChange={(e) => setContents({
                function: {
                    _tag: 'string',
                    value: e
                }
            })}
            className='w-full p-2 rounded-md mb-4 nodrag'
            placeholder='function(a, b) { return a + b }'
            />
        },
        getInputLabels: ({contents}) => {
            const [name, args] = getArgs(contents.function?.value ?? '')
            return E.right(
                args.map((arg) => ({
                        _tag: 'string',
                        value: arg,
                    } as const
                ))
            )
        },
        getTitle: (contents) => {
            const [name, args] = getArgs(contents.function?.value ?? '')
            return name ?? 'function'
        },


    })
}

export default node
