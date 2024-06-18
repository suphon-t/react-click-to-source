import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClickToSource } from 'react-click-to-source'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ClickToSource />
      <Component {...pageProps} />
    </>
  )
}
