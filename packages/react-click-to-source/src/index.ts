import React from 'react'

declare const process: any

export const ClickToSource =
  process.env.NODE_ENV === 'development'
    ? React.lazy(() => import('./components/ClickToSource'))
    : () => null
