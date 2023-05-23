export class NodeInputMissingError extends Error {
  _tag: 'NodeInputMissingError'

  constructor(input: string) {
    super(`
        Missing input ${input}`)
    this._tag = 'NodeInputMissingError'
  }

  public static of = (input: string) =>
    new NodeInputMissingError(input)
}

export class NodeInputTypeMismatchError extends Error {
  _tag: 'NodeInputTypeMismatchError'

  constructor(
    input: string,
    expected: string,
    actual: string
  ) {
    super(`
        Input ${input} type mismatch. Expected ${expected}, got ${actual}`)
    this._tag = 'NodeInputTypeMismatchError'
  }

  public static of = (
    input: string,
    expected: string,
    actual: string
  ) =>
    new NodeInputTypeMismatchError(input, expected, actual)
}

export class NodeAlreadyExistsError extends Error {
  _tag: 'NodeAlreadyExistsError'

  constructor(id: string) {
    super(`
        Node ${id} already exists`)
    this._tag = 'NodeAlreadyExistsError'
  }

  public static of = (id: string) =>
    new NodeAlreadyExistsError(id)
}

export class NodeNotFoundError extends Error {
  _tag: 'NodeNotFoundError'

  constructor(id: string) {
    super(`
      Node ${id} not found`)
    this._tag = 'NodeNotFoundError'
  }

  public static of = (id: string) =>
    new NodeNotFoundError(id)
}

export class EdgeNotFoundError extends Error {
  _tag: 'EdgeNotFoundError'

  constructor(id: string) {
    super(`
      Edge ${id} not found`)
    this._tag = 'EdgeNotFoundError'
  }

  public static of = (id: string) =>
    new EdgeNotFoundError(id)
}

export class OpenAIChatGPTRequestError extends Error {
  _tag: 'OpenAIChatGPTRequestError'

  constructor(message: string) {
    super(`
        OpenAI ChatGPT Request Error: ${message}
    `)
    this._tag = 'OpenAIChatGPTRequestError'
  }

  public static of = (message: string) =>
    new OpenAIChatGPTRequestError(message)
}

export class OpenAIDalle2RequestError extends Error {
  _tag: 'OpenAIDalle2RequestError'

  constructor(message: string) {
    super(`
        OpenAI Dalle2 Request Error: ${message}
    `)
    this._tag = 'OpenAIDalle2RequestError'
  }

  public static of = (message: string) =>
    new OpenAIDalle2RequestError(message)
}
