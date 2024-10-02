export interface Fiber {
  elementType: any
  type: any
  tag: number

  _debugSource?: {
    columnNumber?: number
    fileName: string
    lineNumber?: number
  }
  _debugOwner?: Fiber
}

export interface Target {
  element: Element
  fiber: Fiber
  owners: Fiber[]
}

export type LaunchEditor = (source: NonNullable<Fiber['_debugSource']>) => void
