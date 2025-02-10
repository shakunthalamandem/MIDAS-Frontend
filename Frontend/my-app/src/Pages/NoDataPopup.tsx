import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface NoDataPopupProps {
  open: boolean;
  onClose: () => void;
}

const NoDataPopup: React.FC<NoDataPopupProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleOkClick = () => {
    onClose(); // Close the popup
    navigate('/'); // Navigate to the main page or any other component
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="no-data-dialog">
      <DialogTitle id="no-data-dialog">No Data Found</DialogTitle>
      <DialogContent>
        <p style={{ fontSize: '16px', color: '#555' }}>
          The selected filters returned no data. Please try different filters or adjust your search criteria.
        </p>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleOkClick}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: '#004577',
            '&:hover': { backgroundColor: '#115293' },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoDataPopup;
