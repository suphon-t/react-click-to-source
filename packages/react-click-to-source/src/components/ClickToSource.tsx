'use client'

import { useEffect, useState } from 'react'

import { ContextMenu } from './ContextMenu'
import { Overlay } from './Overlay'
import { Target } from '../types'
import { getEventTarget, getTargetInfo, launchEditor } from '../utils'

export default function ClickToSource() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [contextMenuTarget, setContextMenuTarget] = useState<Target | null>(
    null
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        setIsEnabled(true)
        setTarget(null)
        setContextMenuTarget(null)
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Alt') {
        setIsEnabled(false)
      }
    }

    function onBlur() {
      setIsEnabled(false)
      // setContextMenuTarget(null)
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
      event.preventDefault()
      event.stopPropagation()

      const info = getTargetInfo(getEventTarget(event))
      if (!info) return
      const source = info.owners.find(
        (fiber) => fiber._debugSource
      )?._debugSource
      if (!source) return
      launchEditor(source)
    }

    function onContextMenu(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      const info = getTargetInfo(getEventTarget(event))
      setContextMenuTarget(info)
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
  }, [isEnabled])

  if (contextMenuTarget !== null) {
    return (
      <>
        <Overlay target={contextMenuTarget} />
        <ContextMenu
          target={contextMenuTarget}
          onDismiss={() => setContextMenuTarget(null)}
        />
      </>
    )
  }
  if (isEnabled && target !== null) {
    return <Overlay target={target} />
  }
  return null
}
