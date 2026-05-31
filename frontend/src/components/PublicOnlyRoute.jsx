import * as React from 'react';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return children;
}