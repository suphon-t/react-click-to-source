'use client'

import { useEffect, useState } from 'react'

import { ContextMenu, Position } from './ContextMenu'
import { Overlay } from './Overlay'
import { LaunchEditor, Target } from '../types'
import { getEventTarget, getTargetInfo } from '../utils'

export function ClickToSource({
  launchEditor,
  formatSourceFileName,
}: {
  launchEditor: LaunchEditor
  formatSourceFileName?: (fileName: string) => string
}) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    target: Target
    position: Position
  } | null>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        setIsEnabled(true)
        setTarget(null)
        setContextMenu(null)
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        setIsEnabled(false)
      }
    }

    function onBlur() {
      setIsEnabled(false)
      setContextMenu(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    if (!isEnabled) return

    function onClick(event: MouseEvent) {
      const info = getTargetInfo(getEventTarget(event))
      if (!info) return

      event.preventDefault()
      event.stopPropagation()
      const source = info.owners.find(
        (fiber) => fiber._debugSource
      )?._debugSource
      if (!source) return
      launchEditor(source)
    }

    function onContextMenu(event: MouseEvent) {
      const info = getTargetInfo(getEventTarget(event))
      if (!info) return

      event.preventDefault()
      event.stopPropagation()
      setContextMenu(
        info
          ? {
              target: info,
              position: { x: event.clientX, y: event.clientY },
            }
          : null
      )
      setIsEnabled(false)
    }

    function onMouseEvent(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()
    }

    let lastHoveredNode: HTMLElement | null = null
    function onPointerMove(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      const target = getEventTarget(event)
      if (lastHoveredNode === target) return
      lastHoveredNode = target
      setTarget(getTargetInfo(target))
    }

    window.addEventListener('click', onClick, true)
    window.addEventListener('contextmenu', onContextMenu, true)
    window.addEventListener('mousedown', onMouseEvent, true)
    window.addEventListener('mouseover', onMouseEvent, true)
    window.addEventListener('mouseup', onMouseEvent, true)
    window.addEventListener('pointerdown', onMouseEvent, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', onMouseEvent, true)

    return () => {
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('contextmenu', onContextMenu, true)
      window.removeEventListener('mousedown', onMouseEvent, true)
      window.removeEventListener('mouseover', onMouseEvent, true)
      window.removeEventListener('mouseup', onMouseEvent, true)
      window.removeEventListener('pointerdown', onMouseEvent, true)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', onMouseEvent, true)
    }
  }, [isEnabled, launchEditor])

  if (contextMenu !== null) {
    return (
      <>
        <Overlay target={contextMenu.target} />
        <ContextMenu
          target={contextMenu.target}
          position={contextMenu.position}
          launchEditor={launchEditor}
          onDismiss={() => setContextMenu(null)}
          formatSourceFileName={formatSourceFileName}
        />
      </>
    )
  }
  if (isEnabled && target !== null) {
    return <Overlay target={target} />
  }
  return null
}
