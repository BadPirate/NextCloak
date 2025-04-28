import React from 'react'
import { Navbar, Container } from 'react-bootstrap'

const RootNav = ({ children }: { children: React.ReactNode }) => (
  <div>
    <Navbar variant="dark" bg="secondary">
      <Navbar.Brand href="/" style={{ marginLeft: '1em', textTransform: 'capitalize' }}>
        BadPirate Garage ID
      </Navbar.Brand>
    </Navbar>
    <Container style={{ marginTop: '1em' }}>{children}</Container>
  </div>
)

export default RootNav
