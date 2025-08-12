import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Message } from './utils';

export default function MessageBubble({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <Box sx={{ display: 'inline-block', maxWidth: '72%', p: 1.25, borderRadius: 2, bgcolor: mine ? 'primary.main' : 'grey.200', color: mine ? 'primary.contrastText' : 'text.primary' }}>
        <Typography variant="body2">{m.content}</Typography>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>{new Date(m.created_at).toLocaleTimeString()}</Typography>
      </Box>
    </motion.div>
  );
}