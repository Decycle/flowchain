import {
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Handle, Position } from 'reactflow'
import getHandleColor from './utils'
import useFlowStore, { DefaultNode } from '../../store'
import {
  AnyNodeComponentType,
  Contents,
  Data,
  Datas,
  Labels,
} from '../../types'
import {
  NodeComponentIdMissingError,
  NodeComponentIdNotFoundError,
  NodeNotFoundError,
  ValueConversionError,
} from '../../errors'
import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { monoidObject } from '../../fp-ts-utils'
import { sequenceT } from 'fp-ts/lib/Apply'
import nodeComponents from '..'
import convert from '../../data_type_convert'
import deepEqual from 'deep-equal'
import debounce from 'lodash.debounce'

const BaseNode = memo(({ id }: { id: string }) => {
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
  ) => {
    return node.data.outputs &&
      handle &&
      node.data.outputs[handle]
      ? O.some(node.data.outputs[handle])
      : O.none
  }

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

  const convertValues = (
    values: Datas,
    labels: Labels
  ): E.Either<ValueConversionError, Datas> => {
    const newValues = { ...values }

    for (const label of labels) {
      if (
        Object.keys(values).includes(label.value) &&
        values[label.value] !== undefined
      ) {
        const value = values[label.value] as Data
        if (label._tag != value._tag) {
          const newValue = convert(
            value.value,
            value._tag,
            label._tag
          )
          if (E.isLeft(newValue)) {
            return newValue
          }
          newValues[label.value] = {
            _tag: label._tag,
            value: newValue.right,
          } as Data
        }
      }
    }

    return E.right(newValues)
  }

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
        A.foldMap(monoidObject<string, Data | undefined>())(
          ([handle, value]) => ({
            [handle]: value,
          })
        ),
        (values) => convertValues(values, inputLabels),
        E.getOrElseW((e) => {
          console.error(e)
          return {}
        })
      ),
    deepEqual
  )

  const contents = useFlowStore(
    (state) =>
      pipe(
        state.getNode(id),
        O.map((node) => node.data.contents ?? {}),
        O.getOrElse(() => ({} as Contents))
      ),
    deepEqual
  )

  const [func, afunc, getInputLabels, Component] = pipe(
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
        E.map(
          (componentId): AnyNodeComponentType =>
            nodeComponents[componentId]
        )
      )
    ),
    E.match(
      (e) => {
        console.error(title, e)
        return [undefined, undefined, undefined, undefined]
      },
      (component) => [
        component.func,
        component.afunc,
        component.getInputLabels,
        component.Component,
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
  const [showOutput, setShowOutput] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    pipe(
      getInputLabels,
      O.fromNullable,
      O.map((func) =>
        pipe(
          func({
            contents,
            inputs: parentNodeValues,
          }),
          E.chainW((labels) =>
            setNodeInputLabels(id, labels)
          ),
          E.mapLeft((e) => console.error(e))
        )
      )
    )
  }, [
    id,
    contents,
    parentNodeValues,
    getInputLabels,
    setNodeInputLabels,
    setNodeOutputLabels,
  ])

  const runFunctions = useCallback(() => {
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
        // if function exists
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
  }, [
    func,
    afunc,
    lazy,
    isRunning,
    id,
    parentNodeValues,
    setNodeOutputs,
    buttonClicked,
    contents,
  ])

  useEffect(() => {
    debounce(runFunctions, 500)()
  }, [
    runFunctions,
    func,
    afunc,
    lazy,
    isRunning,
    id,
    parentNodeValues,
    setNodeOutputs,
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
          outputs={outputs}
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

      <button
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto nodrag mb-2'
        onClick={() => setShowOutput(!showOutput)}>
        {showOutput ? 'Hide' : 'Show'} Output
      </button>

      {lazy && (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto nodrag mb-2'
          onClick={() => setButtonClicked(true)}>
          Update
        </button>
      )}
      {outputs &&
        showOutput &&
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
                  className='mb-3 max-w-md max-h-96 no-export'
                />
              ) : (
                <div className='text-sm max-h-96 text-gray-700 mb-3 max-w-md whitespace-pre-wrap overflow-ellipsis'>
                  {'hello'}
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
            className='mb-3 max-w-md max-h-96 no-export'
          />
        ) : (
          <div
            className='text-sm text-gray-700 mb-3 max-w-md whitespace-pre-wrap overflow-hidden nodrag'
            style={{
              maxHeight: '72rem',
            }}
            onClick={() => {
              const value = outputs[Object.keys(outputs)[0]]

              if (value !== undefined) {
                navigator.clipboard.writeText(
                  value.value.toString()
                )
              }
              console.log('copied')
            }}>
            {outputs[
              Object.keys(outputs)[0]
            ]?.value?.toString()}
          </div>
        ))}
    </div>
  )
})

// const BaseNode2 = ({ id }: { id: string }) => {

//   return <div>test</div>
// }

export default BaseNode
// export default BaseNode2
