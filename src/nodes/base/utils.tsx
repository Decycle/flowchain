const pseudorandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getHandleColor = (
  type: string,
  id: string,
  nodeId: string
) => {
  const combinedString = `${type}${id}${nodeId}`
  let hash = 0

  for (let i = 0; i < combinedString.length; i++) {
    hash =
      combinedString.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.floor(pseudorandom(hash) * 360)

  return `hsl(${hue}, 54%, 61%)`
}

export default getHandleColor
