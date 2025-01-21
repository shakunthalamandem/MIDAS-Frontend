import React, { Component, ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, errorMessage: 'Something went wrong. Please try again later.' };
  }

  componentDidCatch(error: Error) {
    console.error('Caught by Error Boundary:', error);
  }

  resetError = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPopup message={this.state.errorMessage} onClose={this.resetError} />;
    }
    return this.props.children;
  }
}

interface ErrorPopupProps {
  message: string;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold', color: '#d32f2f' }}>
        No Data Available
      </DialogTitle>
      <DialogContent style={{ textAlign: 'center', fontSize: '18px', padding: '20px' }}>
        {message}
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorBoundary;
