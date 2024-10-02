import { useEffect, useMemo } from 'react'

import {
  FloatingOverlay,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react'
import { css } from 'goober'

import { LaunchEditor, Target } from '../types'
import { getDisplayNameForInstance } from '../utils'

const Container = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  color: black;
  background: rgba(255, 255, 255, 0.8);
  box-shadow:
    0 10px 15px -3px #0000001a,
    0 4px 6px -4px #0000001a;
  backdrop-filter: blur(16px) saturate(125%);
  border-radius: 6px;
  z-index: 99999;
`

const Layer = css`
  display: flex;
  background: transparent;
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
  margin: 0;
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

  & p {
    margin: 0;
  }
`

export interface Position {
  x: number
  y: number
}

export function ContextMenu({
  target,
  position,
  launchEditor,
  onDismiss,
}: {
  target: Target
  position: Position
  launchEditor: LaunchEditor
  onDismiss?: () => void
}) {
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open: true,
    onOpenChange: (open) => !open && onDismiss?.(),
    placement: 'right-start',
    middleware: [
      offset({
        mainAxis: 1,
        crossAxis: -4,
      }),
      flip({
        crossAxis: false,
        padding: 4,
      }),
      shift({
        padding: 4,
      }),
    ],
    whileElementsMounted: autoUpdate,
  })
  useEffect(() => {
    refs.setPositionReference({
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: position.x,
        y: position.y,
        top: position.y,
        left: position.x,
        right: position.x,
        bottom: position.y,
      }),
    })
  }, [refs, position.x, position.y])

  const dismiss = useDismiss(context)

  const { getFloatingProps } = useInteractions([dismiss])

  const ownersWithSource = useMemo(
    () => target.owners.filter((fiber) => fiber._debugSource),
    [target]
  )

  return (
    <FloatingPortal>
      <FloatingOverlay
        lockScroll
        style={{ pointerEvents: 'auto', zIndex: 99999 }}
      >
        <div
          ref={refs.setFloating}
          className={Container}
          style={{
            ...floatingStyles,
            visibility: isPositioned ? 'visible' : 'hidden',
          }}
          {...getFloatingProps()}
        >
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
