import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  ReactFlowInstance,
  useReactFlow,
} from 'reactflow'

import 'reactflow/dist/style.css'
import nodeTypes from './nodes'

import useFlowStore, { AppState } from './store'
import { shallow } from 'zustand/shallow'

const selector = (state: AppState) => ({
  nodes: state.nodes,
  nodeValues: state.nodeValues,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  setNodes: state.setNodes,
  setNodeValues: state.setNodeValues,
  onEdgesChange: state.onEdgesChange,
  setEdges: state.setEdges,
  onConnect: state.onConnect,
})

const App = () => {
  const {
    nodes,
    nodeValues,
    edges,
    onNodesChange,
    setNodes,
    setNodeValues,
    onEdgesChange,
    setEdges,
    onConnect,
  } = useFlowStore(selector, shallow)

  const [rfInstance, setRfInstance] =
    useState<ReactFlowInstance | null>(null)

  const { setViewport } = useReactFlow()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 's') {
        e.preventDefault()
        console.log('saving')
        if (rfInstance) {
          const flow = rfInstance.toObject()
          localStorage.setItem('flow', JSON.stringify(flow))
          localStorage.setItem(
            'flowValues',
            JSON.stringify(nodeValues)
          )
        }
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Make sure to save your flow!'
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    )
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      )
    }
  }, [rfInstance, nodeValues])

  useEffect(() => {
    const restoreFlow = async () => {
      const rawFlow = localStorage.getItem('flow')
      if (!rawFlow) {
        return
      }
      const flow = JSON.parse(rawFlow)
      if (!flow) {
        return
      }
      const { x = 0, y = 0, zoom = 1 } = flow.viewport

      setNodes(flow.nodes ?? [])
      setEdges(flow.edges ?? [])
      setViewport({ x, y, zoom })

      const rawFlowValues =
        localStorage.getItem('flowValues')
      if (!rawFlowValues) {
        return
      }
      const flowValues = JSON.parse(rawFlowValues)
      if (!flowValues) {
        return
      }
      setNodeValues(flowValues)
    }

    restoreFlow()
  }, [setNodes, setEdges, setViewport, setNodeValues])

  return (
    <div className='h-screen w-screen bg-slate-50'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}>
        <Controls />
        <MiniMap />
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1}
        />
      </ReactFlow>
    </div>
  )
}

export default App
