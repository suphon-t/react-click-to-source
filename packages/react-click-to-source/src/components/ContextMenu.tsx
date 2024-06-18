import { useEffect, useMemo, useRef } from 'react'

import {
  FloatingArrow,
  FloatingOverlay,
  FloatingPortal,
  arrow,
  autoPlacement,
  autoUpdate,
  offset,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { css } from 'goober'

import { Target } from '../types'
import { getDisplayNameForInstance, launchEditor } from '../utils'

const Container = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  color: black;
  background: white;
  border-radius: 6px;
  z-index: 99999;
`

const Layer = css`
  display: flex;
  background: white;
  border: none;
  flex-direction: column;
  padding: 2px 4px;
  font-family: monospace;
  cursor: pointer;
  border-radius: 2px;

  &:hover {
    background: #2563eb;
  }
`

const ComponentName = css`
  color: #2563eb;
  font-size: 14px;

  .${Layer}:hover & {
    color: white;
  }
`

const SourceLocation = css`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 32px;
  font-size: 10px;
  color: #6b7280;
  .${Layer}:hover & {
    color: #d1d5db;
  }
`

export function ContextMenu({
  target,
  onDismiss,
}: {
  target: Target
  onDismiss?: () => void
}) {
  const arrowRef = useRef(null)
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open: true,
    onOpenChange: (open) => !open && onDismiss?.(),
    placement: 'right-start',
    middleware: [
      autoPlacement({ alignment: 'start' }),
      offset(4),
      arrow({ element: arrowRef, padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const dismiss = useDismiss(context)

  const { getFloatingProps } = useInteractions([dismiss])

  const { setReference } = refs
  useEffect(() => {
    setReference(target.element)
    return () => setReference(null)
  }, [setReference, target])

  const ownersWithSource = useMemo(
    () => target.owners.filter((fiber) => fiber._debugSource),
    [target]
  )

  return (
    <FloatingPortal>
      <FloatingOverlay style={{ zIndex: 99999 }}>
        <div
          ref={refs.setFloating}
          className={Container}
          style={{
            ...floatingStyles,
            visibility: isPositioned ? 'visible' : 'hidden',
          }}
          {...getFloatingProps()}
        >
          <FloatingArrow
            ref={arrowRef}
            context={context}
            width={10}
            height={5}
            fill="white"
          />
          {ownersWithSource.map((fiber, index) => {
            const source = fiber._debugSource!
            return (
              <button
                key={index}
                className={Layer}
                onClick={() => launchEditor(source)}
              >
                <p className={ComponentName}>
                  &lt;
                  <span style={{ fontWeight: 'bold' }}>
                    {getDisplayNameForInstance(fiber)}
                  </span>
                  &gt;
                </p>
                <div className={SourceLocation}>
                  <p
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {source.fileName.replace(/.*(src|pages)/, '$1')}
                  </p>
                  <p>
                    {source.lineNumber}:{source.columnNumber}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </FloatingOverlay>
    </FloatingPortal>
  )
}
