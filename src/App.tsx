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
  currentId: state.currentId,
  setCurrentId: state.setCurrentId,
  onNodesChange: state.onNodesChange,
  setNodes: state.setNodes,
  addNode: state.addNode,
  onEdgesChange: state.onEdgesChange,
  setEdges: state.setEdges,
  onConnect: state.onConnect,
  onNodesDelete: state.onNodesDelete,
})

const App = () => {
  const {
    nodes,
    edges,
    currentId,
    setCurrentId,
    onNodesChange,
    setNodes,
    addNode,
    onEdgesChange,
    setEdges,
    onConnect,
    onNodesDelete,
  } = useFlowStore(selector, shallow)

  const rfInstance = useReactFlow()

  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const { setViewport } = useReactFlow()

  useEffect(() => {
    const saveFlow = () => {
      if (rfInstance) {
        const flow = rfInstance.toObject()
        const appData = {
          flow,
          currentId,
        }
        localStorage.setItem(
          'flow',
          JSON.stringify(appData)
        )
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key == 's') {
        e.preventDefault()
        console.log('saving')
        saveFlow()
        return
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key == 'y') ||
        ((e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key == 'z')
      ) {
        e.preventDefault()
        console.log('redo')
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key == 'z') {
        e.preventDefault()
        console.log('undo')
        return
      }
    }

    const handleBeforeUnload = () => {
      // save flow
      saveFlow()
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
  }, [rfInstance, currentId])

  useEffect(() => {
    const restoreFlow = async () => {
      const rawFlow = localStorage.getItem('flow')
      if (!rawFlow) {
        return
      }
      const appData = JSON.parse(rawFlow)
      console.log('appData', appData)
      if (!appData) {
        return
      }

      const { flow, currentId } = appData
      if (!flow || !currentId) {
        return
      }

      const { x = 0, y = 0, zoom = 1 } = flow.viewport

      if (flow.nodes) {
        setNodes(flow.nodes)
      }
      if (flow.edges) {
        setEdges(flow.edges)
      }

      setViewport({ x, y, zoom })
      setCurrentId(currentId)
    }

    restoreFlow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
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
