import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import usePageTitle from '../hooks/usePageTitle';
import { supabase } from '../lib/supabase';

export default function Login() {
  usePageTitle('Sign in');
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    navigate('/'); // session now exists; protected routes will allow it
  };

  const social = async (provider) => {
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
    // On success the browser redirects to the provider; no further code here.
  };

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
      <Box>
        <Typography variant="h4" component="h1">Welcome back</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Sign in to your vault.
        </Typography>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <FormLabel htmlFor="email" required>Email</FormLabel>
            <OutlinedInput
              id="email" type="email" size="small" required
              autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Stack>
          <Stack spacing={0.5}>
            <FormLabel htmlFor="password" required>Password</FormLabel>
            <OutlinedInput
              id="password" type="password" size="small" required
              autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Stack>
          <Button
            type="submit" variant="contained" disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>

      <Divider>or</Divider>

      <Stack spacing={1.5}>
        <Button variant="outlined" startIcon={<GoogleIcon />} onClick={() => social('google')}>
          Continue with Google
        </Button>
        <Button variant="outlined" startIcon={<GitHubIcon />} onClick={() => social('github')}>
          Continue with GitHub
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
        No account?{' '}
        <Link component={RouterLink} to="/register">Create one</Link>
      </Typography>
    </Stack>
  );
}