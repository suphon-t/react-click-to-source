/* eslint-disable react-refresh/only-export-components */
import { ClickToSource as ClickToSourceImpl } from './components/ClickToSource'
import { launchEditorNextjs, launchEditorVite } from './utils'

declare const process: any

interface ClickToSourceProps {
  formatSourceFileName?: (fileName: string) => string
}

export const ClickToSourceNextjs =
  process.env.NODE_ENV === 'development'
    ? function ClickToSource(props: ClickToSourceProps) {
        return (
          <ClickToSourceImpl {...props} launchEditor={launchEditorNextjs} />
        )
      }
    : () => null

export const ClickToSourceVite =
  process.env.NODE_ENV === 'development'
    ? function ClickToSource(props: ClickToSourceProps) {
        return <ClickToSourceImpl {...props} launchEditor={launchEditorVite} />
      }
    : () => null

/**
 * @deprecated Use framework-specific versions instead, such as `ClickToSourceNextjs`
 */
export const ClickToSource = ClickToSourceNextjs
