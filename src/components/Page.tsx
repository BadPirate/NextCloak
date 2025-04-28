import React from 'react'
import Head from 'next/head'

interface PageProps {
  title?: string
  children: React.ReactNode
}

const Page: React.FC<PageProps> = ({ title, children }) => (
  <>
    {title && (
      <Head>
        <title>{title}</title>
      </Head>
    )}
    {children}
  </>
)

export default Page
