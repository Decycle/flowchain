import React, {
  memo,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import useFlowStore, { DefaultNode } from '../../store'
import { Content, Contents, Data, Datas } from '../../types'
import {
  NodeComponentIdMissingError,
  NodeComponentIdNotFoundError,
  NodeNotFoundError,
} from '../errors'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { log, monoidObject } from '../../fp-ts-utils'
import { sequenceT } from 'fp-ts/lib/Apply'
import { shallow } from 'zustand/shallow'
import nodeComponents from '..'

const BaseNode = ({ id }: { id: string }) => {
  const node = pipe(
    useFlowStore((state) => state.getNode(id)),
    E.fromOption(() => NodeNotFoundError.of(id)),
    E.getOrElseW((e) => {
      console.error(e)
      return null
    }),
    O.fromNullable
  )

  const getOutputs = (
    node: DefaultNode,
    handle: string | null | undefined
  ) =>
    node.data.outputs && handle && node.data.outputs[handle]
      ? O.some(node.data.outputs[handle])
      : O.none

  const parentNodeValues: Datas = useFlowStore(
    (state) =>
      pipe(
        state.getEdges(),
        A.filter((edge) => edge.target === id),
        A.map((edge) =>
          pipe(
            sequenceT(O.Applicative)(
              O.fromNullable(edge.targetHandle),
              pipe(
                state.getNode(edge.source),
                O.chain((node) =>
                  getOutputs(node, edge.sourceHandle)
                )
              )
            )
          )
        ),
        A.filterMap((tuple) => tuple),
        A.foldMap(monoidObject<string, Data | null>())(
          ([handle, value]) => ({
            [handle]: value,
          })
        )
      ),
    shallow
  )

  const [
    title,
    description,
    inputLabels,
    outputLabels,
    lazy,
    outputs,
  ] = pipe(
    node,
    O.map((node) => node.data),
    O.fold(
      () => ['', '', [], [], false, {}],
      (data) => [
        data.title,
        data.description,
        data.inputLabels,
        data.outputLabels,
        data.lazy,
        data.outputs || {},
      ]
    )
  )

  const contents = useFlowStore(
    (state) =>
      pipe(
        state.getNode(id),
        O.map((node) => node.data.contents ?? {}),
        O.getOrElse(() => ({} as Contents))
      ),
    shallow
  )

  const [getInputLabels, getOutputLabels] = pipe(
    node,
    O.map((node) => node.data),
    O.fold(
      () => [undefined, undefined],
      (data) => [data.getInputs, data.getOutputs]
    )
  )

  const [func, afunc, Component] = pipe(
    node,
    O.chain((node) =>
      pipe(node.data.componentId, O.fromNullable)
    ),
    E.fromOption(() => NodeComponentIdMissingError.of()),
    E.chainW(
      flow(
        E.fromPredicate(
          (
            componentId
          ): componentId is keyof typeof nodeComponents =>
            componentId in nodeComponents,
          (componentId) =>
            NodeComponentIdNotFoundError.of(componentId)
        ),
        E.map((componentId) => nodeComponents[componentId])
      )
    ),
    E.match(
      (e) => {
        console.error(e)
        return [undefined, undefined, undefined]
      },
      (component) => [
        component.func,
        component.afunc,
        component.component,
      ]
    )
  )

  const [
    setNodeOutputs,
    setNodeContents,
    setNodeInputLabels,
    setNodeOutputLabels,
  ] = useFlowStore((state) => [
    state.setNodeOutputs,
    state.setNodeContents,
    state.setNodeInputLabels,
    state.setNodeOutputLabels,
  ])

  const [buttonClicked, setButtonClicked] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const getLabels = () => {
    pipe(
      getInputLabels,
      O.fromNullable,
      O.map((func) =>
        pipe(
          func(contents),
          E.chainW((labels) =>
            setNodeInputLabels(id, labels)
          ),
          E.mapLeft((e) => console.error(e))
        )
      )
    )

    pipe(
      getOutputLabels,
      O.fromNullable,
      O.map((func) =>
        pipe(
          func(contents),
          E.chainW((labels) =>
            setNodeOutputLabels(id, labels)
          ),
          E.mapLeft((e) => console.error(e))
        )
      )
    )
  }

  useEffect(getLabels, [
    id,
    contents,
    getInputLabels,
    getOutputLabels,
    setNodeInputLabels,
    setNodeOutputLabels,
  ])

  const runFunctions = () => {
    if (lazy) {
      if (!buttonClicked) {
        return
      } else {
        setButtonClicked(false)
      }
    }
    if (isRunning) {
      return
    }

    console.log('running', id, parentNodeValues)

    const runFunc = () =>
      pipe(
        func,
        (func) => {
          console.log('func', func)
          return func
        },
        O.fromNullable,
        O.chain((func) =>
          pipe(
            func({
              inputs: parentNodeValues,
              contents,
            }),
            E.getOrElseW((e) => {
              console.error(e)
              return null
            }),
            O.fromNullable
          )
        ),
        O.map((output) => {
          setNodeOutputs(id, output)
        })
      )

    const runAfunc = () =>
      pipe(
        afunc,
        O.fromNullable,
        O.map((func) =>
          pipe(
            func({ inputs: parentNodeValues, contents }),
            TE.getOrElseW((e) => {
              console.error(e)
              setIsRunning(false)
              return T.of(null)
            })
          )
        ),
        O.map((task) => {
          setIsRunning(true)
          return pipe(
            task,
            T.map((output) =>
              pipe(
                output,
                O.fromNullable,
                O.map((output) => {
                  setNodeOutputs(id, output)
                  setIsRunning(false)
                })
              )
            )
          )
        })
      )

    runFunc()
    pipe(
      runAfunc(),
      O.map((task) => task())
    )
  }

  useEffect(runFunctions, [
    func,
    afunc,
    lazy,
    isRunning,
    id,
    parentNodeValues,
    setNodeOutputs,
    inputLabels,
    buttonClicked,
    contents,
  ])

  return (
    <div className='bg-slate-50 rounded-md shadow-md p-4 flex flex-col items-start border-black'>
      <h2 className='text-xl font-semibold mb-2 '>
        {title}
      </h2>
      <p className='text-sm text-gray-700 mb-3'>
        {description}
      </p>
      {outputLabels.map((label) => (
        <div
          key={label.value}
          className='relative ml-auto -mr-4'>
          <h3 className='w-full mr-4'>{label.value}</h3>
          <Handle
            type='source'
            position={Position.Right}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(label.value),
            }}
            id={label.value}
          />
        </div>
      ))}
      <div className='mb-2' />
      {Component && (
        <Component
          contents={contents}
          setContents={(contents) => {
            console.log(contents)
            console.log(setNodeContents(id, contents))
          }}
        />
      )}
      {inputLabels.map((label) => (
        <div key={label.value} className='relative -ml-4'>
          <Handle
            type='target'
            position={Position.Left}
            className='bg-white w-2.5 h-2.5 border-2'
            style={{
              borderColor: getHandleColor(label.value),
            }}
            id={label.value}
          />
          <h3 className='w-full ml-4'>{label.value}</h3>
        </div>
      ))}
      <div className='mb-3' />
      {isRunning && (
        <p className='text-sm text-gray-700 mb-3'>
          Loading...
        </p>
      )}
      {outputs &&
        Object.keys(outputs).length > 0 &&
        (Object.keys(outputs).length > 1 ? (
          Object.keys(outputs).map((key) => (
            <div key={key} className=''>
              <h3 className='w-full mr-4 text-gray-800'>
                {key}
              </h3>
              {outputs[key]?._tag === 'imageUrl' ? (
                <img
                  src={outputs[key]?.value as string}
                  alt='img'
                  className='mb-3 max-w-md no-export'
                />
              ) : (
                <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
                  {outputs[key]?.value.toString()}
                </div>
              )}
            </div>
          ))
        ) : outputs[Object.keys(outputs)[0]]?._tag ===
          'imageUrl' ? (
          <img
            src={
              outputs[Object.keys(outputs)[0]]
                ?.value as string
            }
            alt='img'
            className='mb-3 max-w-md no-export'
          />
        ) : (
          <div className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap'>
            {outputs[
              Object.keys(outputs)[0]
            ]?.value?.toString()}
          </div>
        ))}

      {lazy && (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto nodrag'
          onClick={() => setButtonClicked(true)}>
          Update
        </button>
      )}
    </div>
  )
}

export default BaseNode