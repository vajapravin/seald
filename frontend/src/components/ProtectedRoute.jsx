import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    // Bounce to login, remembering where they were headed
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}