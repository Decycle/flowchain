const pseudorandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const getHandleColor = (name: string) => {
  let hash = 0

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.floor(pseudorandom(hash) * 360)

  return `hsl(${hue}, 54%, 61%)`
}

export default getHandleColor
