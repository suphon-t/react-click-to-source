import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ClickToSourceNextjs } from 'react-click-to-source'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ClickToSourceNextjs />
      <Component {...pageProps} />
    </>
  )
}
