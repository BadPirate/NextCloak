/* eslint-disable react/jsx-props-no-spreading */
import '../styles/bootstrap.min.css'
import '../styles/global.css'

import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { pageProps: { session?: Session } }) => (
  <SessionProvider session={session}>
    <Component {...pageProps} />
  </SessionProvider>
)
export default App
