// import { useEffect, useState } from 'react'
// import { useCallback } from 'react'

// type NodeProps = {
//   id: string
// }

// const title = 'Split'
// const description =
//   'A node that splits an object/array into multiple outputs'
// const inputLabels = ['input']

// const SplitNode = ({ id }: NodeProps) => {
//   const [outputLabels, setOutputLabels] = useState<
//     string[]
//   >([])

//   const func: NodeFunc = useCallback((inputs) => {
//     const input = inputs['input']
//     if (input == null) {
//       return {}
//     }

//     if (Array.isArray(input)) {
//       setOutputLabels(input.map((_, i) => i.toString()))
//       return input.reduce((acc, val, i) => {
//         acc[i] = val
//         return acc
//       }, {})
//     }
//     if (typeof input === 'object') {
//       setOutputLabels(Object.keys(input))
//       return input
//     }
//     return {}
//   }, [])

//   return (
//     <GenericNode
//       id={id}
//       data={{
//         title,
//         description,
//         inputLabels,
//         outputLabels,
//         func,
//       }}></GenericNode>
//   )
// }

// export default SplitNode
