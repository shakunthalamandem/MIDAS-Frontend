import React from 'react'
import { Container, Typography } from '@mui/material'
import MidasChatbotData from './MidasChatbotData'
import MidasChatbotIndexer from './MidasChatbotIndexer'

const MidasChatbotMain = () => {
  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <Typography variant="h5" align="center" fontWeight={600} color='#002060'>Midas Chatbot Main Page</Typography>
      <MidasChatbotData />
      <MidasChatbotIndexer />
    </Container>
  )
}

export default MidasChatbotMain
