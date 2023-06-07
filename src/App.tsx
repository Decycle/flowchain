import { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useReactFlow,
  ControlButton,
} from 'reactflow'

import 'reactflow/dist/style.css'

import useFlowStore, { AppState } from './store'
import { shallow } from 'zustand/shallow'
import SideBar from './sidebar'
import { toSvg } from 'html-to-image'
import {
  ArchiveBoxArrowDownIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid'
import BaseNode from './nodes/base/baseNode'
import nodeConfigs from './nodes'
import { NodeConfigsString } from './store'

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

const DownloadStateButton = () => {
  const states = useFlowStore.getState()

  const exportState = async () => {
    return JSON.stringify(states, null, 2)
  }

  return (
    <ControlButton
      onClick={async () => {
        const state = await exportState()
        const link = document.body.appendChild(
          document.createElement('a')
        )
        link.download = 'flow.json'
        link.href =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(state)
        link.click()
        link.remove()
      }}
      className='border-1 border-blue-500 rounded-md p-2'>
      <ArchiveBoxArrowDownIcon />
    </ControlButton>
  )
}

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
})

const appNodeTypes = {
  baseNode: BaseNode,
}

const App = () => {
  const {
    nodes,
    edges,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore(selector, shallow)

  const rfInstance = useReactFlow()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

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

      if (Object.keys(nodeConfigs).includes(type)) {
        addNode(type as NodeConfigsString, position)
        console.log('adding node: ', type)
      }
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
            <DownloadStateButton />
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
