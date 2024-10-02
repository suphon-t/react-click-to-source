// Mostly from https://github.com/ericclemmons/click-to-component
import { Fiber } from './types'

export function getEventTarget(event: MouseEvent): any {
  if (event.composed) {
    return event.composedPath()[0] as any
  }

  return event.target as any
}

export function getTargetInfo(element: Element) {
  const fiber = getReactInstanceForElement(element)
  if (!fiber) {
    return null
  }
  const owners = getOwners(fiber)
  return { element, fiber, owners }
}

export function getOwners(fiber: Fiber | undefined) {
  let current = fiber
  const owners: Fiber[] = []
  while (current) {
    owners.push(current)
    current = current._debugOwner
  }
  return owners
}

function getReactInstanceForElement(element: Element): Fiber | undefined {
  // Prefer React DevTools, which has direct access to `react-dom` for mapping `element` <=> Fiber
  if ('__REACT_DEVTOOLS_GLOBAL_HOOK__' in window) {
    const { renderers } = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__

    for (const renderer of renderers.values()) {
      try {
        const fiber = renderer.findFiberByHostInstance(element)
        if (fiber) return fiber
      } catch {
        // If React is mid-render, references to previous nodes may disappear during the click events
        // (This is especially true for interactive elements, like menus)
      }
    }
  }

  if ('_reactRootContainer' in element) {
    return (element as any)._reactRootContainer._internalRoot.current.child
  }

  for (const key in element) {
    if (key.startsWith('__reactFiber')) return (element as any)[key]
  }
}

export function getDisplayNameForInstance(instance: Fiber) {
  const { elementType, tag } = instance

  switch (tag) {
    case 0: // FunctionComponent
    case 1: // ClassComponent
      return elementType.displayName || elementType.name || 'Anonymous'

    case 5: // HostComponent:
      return elementType

    case 6: // HostText:
      return 'String'

    case 7: // Fragment
      return 'React.Fragment'

    case 9: // ContextConsumer
      return 'Context.Consumer'

    case 10: // ContextProvider
      return 'Context.Provider'

    case 11: // ForwardRef
      if (elementType.displayName || elementType.name)
        return `ForwardRef(${elementType.displayName || elementType.name})`
      return `ForwardRef(${elementType.render.displayName || elementType.render.name || 'Anonymous'})`

    case 15: // MemoComponent
      // Attempt to get name from wrapped component
      return elementType.type.name || 'React.memo'

    case 16: // LazyComponent
      return 'React.lazy'

    default:
      console.warn(`Unrecognized React Fiber tag: ${tag}`, instance)
      return 'Unknown Component'
  }
}

export function launchEditorNextjs(source: NonNullable<Fiber['_debugSource']>) {
  const params = new URLSearchParams({
    file: source.fileName,
    lineNumber: String(source.lineNumber),
    column: String(source.columnNumber || 0),
  })
  fetch(`/__nextjs_launch-editor?${params}`)
}

export function launchEditorVite(source: NonNullable<Fiber['_debugSource']>) {
  const params = new URLSearchParams({
    file: `${source.fileName}:${source.lineNumber}:${source.columnNumber || 0}`,
  })
  fetch(`/__open-in-editor?${params}`)
}
