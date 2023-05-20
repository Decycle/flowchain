import nodeTypes from './nodes'

const nodes = [
  {
    label: 'Input',
    type: 'inputNode',
  },
  {
    label: 'Output',
    type: 'outputNode',
  },
]
const SideBarItem = ({
  label,
  type,
}: {
  label: string
  type: string
}) => {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData(
      'application/reactflow',
      nodeType
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      key={type}
      className='bg-white rounded-md shadow-md p-4 m-3 mb-1'
      onDragStart={(e) => onDragStart(e, type)}
      draggable>
      {label}
    </div>
  )
}

const SideBar = () => {
  const bannedNodes = ['genericNode']

  const types = Object.keys(nodeTypes).filter(
    (type) => !bannedNodes.includes(type)
  )

  return (
    <div className='w-full h-full flex flex-col'>
      {types.map((type) => (
        <SideBarItem key={type} type={type} label={type} />
      ))}
    </div>
  )
}

export default SideBar
