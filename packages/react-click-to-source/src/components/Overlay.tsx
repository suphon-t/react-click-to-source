import { useEffect } from 'react'

import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react'
import { css } from 'goober'

import { Fiber, Target } from '../types'
import { getDisplayNameForInstance } from '../utils'

const ElementOverlay = css`
  background: rgba(59, 130, 246, 0.2);
  pointer-events: none;
  z-index: 99999;
`

const Tooltip = css`
  background: #374151;
  padding: 4px;
  font-size: 12px;
  font-family: monospace;
  font-weight: bold;
  color: #f472b6;
  border-radius: 2px;
  pointer-events: none;
  z-index: 99999;
`

export function Overlay({ target }: { target: Target }) {
  const { refs, floatingStyles, isPositioned } = useFloating({
    middleware: [
      {
        name: 'position-over',
        fn: (state) => {
          const { elements, rects } = state
          elements.floating.style.height = `${rects.reference.height}px`
          elements.floating.style.width = `${rects.reference.width}px`
          return { x: rects.reference.x, y: rects.reference.y }
        },
      },
    ],
    whileElementsMounted: autoUpdate,
  })
  const {
    refs: tooltipRefs,
    floatingStyles: tooltipFloatingStyles,
    isPositioned: tooltipIsPositioned,
  } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(4), shift(), flip()],
    whileElementsMounted: autoUpdate,
  })

  const { setReference } = refs
  const { setReference: setTooltipReference } = tooltipRefs
  useEffect(() => {
    setReference(target.element)
    setTooltipReference(target.element)
    return () => setReference(null)
  }, [setReference, setTooltipReference, target])

  const fiber = target.fiber
  const owner: Fiber | undefined = fiber._debugOwner

  return (
    <>
      <div
        ref={refs.setFloating}
        className={ElementOverlay}
        style={{
          ...floatingStyles,
          visibility: isPositioned ? 'visible' : 'hidden',
        }}
      />
      <div
        ref={tooltipRefs.setFloating}
        className={Tooltip}
        style={{
          ...tooltipFloatingStyles,
          visibility: tooltipIsPositioned ? 'visible' : 'hidden',
        }}
      >
        {getDisplayNameForInstance(target.fiber)}
        {owner && ` (in ${getDisplayNameForInstance(owner)})`}
      </div>
    </>
  )
}
