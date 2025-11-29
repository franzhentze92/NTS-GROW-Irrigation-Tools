import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/irrigation');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          color: '#8cb43a',
          borderColor: '#8cb43a',
          '&:hover': {
            backgroundColor: 'rgba(140, 180, 58, 0.1)',
            borderColor: '#8cb43a',
          },
        }}
      >
        Back to Irrigation Calculators
      </Button>
    </Box>
  );
};

export default BackButton; 