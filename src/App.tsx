import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
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
  Node,
  Panel,
  getRectOfNodes,
  getTransformForBounds,
  ControlButton,
} from 'reactflow'

import 'reactflow/dist/style.css'
import nodeTypes from './nodes'

import useFlowStore, { AppState } from './store'
import { shallow } from 'zustand/shallow'
import SideBar from './sidebar'
import { toSvg } from 'html-to-image'
import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import BaseNode from './nodes/baseNode'

const downloadImage = async (dataUrl: string) => {
  const link = document.body.appendChild(
    document.createElement('a')
  )
  link.download = 'flow.svg'
  link.href = dataUrl
  link.click()
  link.remove()
}

const DownloadButton = () => {
  const rfInstance = useReactFlow()

  const exportView = async () => {
    const element: HTMLElement | null =
      document.querySelector('.react-flow')
    if (!element) {
      return
    }

    rfInstance.fitView()

    const url = await toSvg(element, {
      filter: (node) => {
        // we don't want to add the minimap and the controls to the image
        if (
          node?.classList?.contains(
            'react-flow__minimap'
          ) ||
          node?.classList?.contains(
            'react-flow__controls'
          ) ||
          node?.classList?.contains('no-export')
        ) {
          return false
        }

        return true
      },
    })

    await downloadImage(url)
  }

  return (
    <ControlButton
      onClick={() => exportView()}
      className='border-1 border-blue-500 rounded-md p-2'>
      <ArrowDownTrayIcon />
    </ControlButton>
  )
}

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  addNode: state.addNode,
})

const appNodeTypes = {
  baseNode: BaseNode,
}

const App = () => {
  const { nodes, edges, addNode } = useFlowStore(
    selector,
    shallow
  )

  const rfInstance = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const { setViewport } = useReactFlow()

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    },
    []
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData(
        'application/reactflow'
      )
      if (
        !reactFlowWrapper.current ||
        typeof type === 'undefined' ||
        !type ||
        !rfInstance
      ) {
        return
      }

      const reactFlowBounds =
        reactFlowWrapper.current.getBoundingClientRect()

      const position = rfInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      if (type !== 'openai-chat') return

      addNode(type, position)
      console.log('adding node: ', type)
    },
    [addNode, rfInstance]
  )

  const [sideBarOpen, setSideBarOpen] = useState(true)

  return (
    <div className='h-screen w-screen flex flex-row'>
      {sideBarOpen && (
        <div className='h-full flex-grow-1 bg-slate-100'>
          <SideBar />
        </div>
      )}
      <div
        className='h-full flex-grow-5 bg-slate-50'
        ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={appNodeTypes}
          onDragOver={onDragOver}
          onDrop={onDrop}
          minZoom={0.15}
          fitView>
          <Controls>
            <ControlButton
              onClick={() => setSideBarOpen(!sideBarOpen)}>
              {sideBarOpen ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </ControlButton>
            <DownloadButton />
          </Controls>
          <MiniMap />
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export default App
