import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return;
    navigate(session ? '/' : '/login', { replace: true });
  }, [session, loading, navigate]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, width: '100%' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Confirming your account…
        </Typography>
      </Stack>
    </Box>
  );
}