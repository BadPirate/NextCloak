import '../styles/bootstrap.min.css'
import '../styles/global.css'

import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"

function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session: any } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
export default App
