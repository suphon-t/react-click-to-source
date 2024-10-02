/* eslint-disable react-refresh/only-export-components */
import { ClickToSource as ClickToSourceImpl } from './components/ClickToSource'
import { launchEditorNextjs, launchEditorVite } from './utils'

declare const process: any

export const ClickToSourceNextjs =
  process.env.NODE_ENV === 'development'
    ? function ClickToSource() {
        return <ClickToSourceImpl launchEditor={launchEditorNextjs} />
      }
    : () => null

export const ClickToSourceVite =
  process.env.NODE_ENV === 'development'
    ? function ClickToSource() {
        return <ClickToSourceImpl launchEditor={launchEditorVite} />
      }
    : () => null

/**
 * @deprecated Use framework-specific versions instead, such as `ClickToSourceNextjs`
 */
export const ClickToSource = ClickToSourceNextjs
