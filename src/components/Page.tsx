import React from 'react'
import Head from 'next/head'
import RootNav from './RootNav'

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
    <RootNav>{children}</RootNav>
  </>
)

export default Page
