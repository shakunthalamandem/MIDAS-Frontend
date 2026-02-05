import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import { motion } from 'framer-motion';

interface NoDataPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

const NoDataPopup: React.FC<NoDataPopupProps> = ({ open, onClose, onConfirm  }) => {
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'white',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Typography variant="h6" color="#002060" gutterBottom>
          No Data Available for Selected Filters
        </Typography>
        <Typography variant="body2" color="#000000" sx={{ mb: 3 }}>
          Please change the applied filters and try again.
        </Typography>
        <Button
  variant="contained"
  sx={{ bgcolor: '#002060', '&:hover': { bgcolor: '#001540' } }}
  onClick={onConfirm || onClose} // ✅ fallback to onClose if onConfirm not provided
>
  Okay
</Button>

      </Box>
    </Modal>
  );
};

export default NoDataPopup;
