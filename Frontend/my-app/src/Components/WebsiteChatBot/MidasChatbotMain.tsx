import React from 'react'
import { Container } from '@mui/material'
import MidasChatbotData from './MidasChatbotData'
import MidasChatbotIndexer from './MidasChatbotIndexer'

const MidasChatbotMain = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <MidasChatbotData />
      <MidasChatbotIndexer />
    </Container>
  )
}

export default MidasChatbotMain
