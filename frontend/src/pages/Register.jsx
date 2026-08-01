import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import usePageTitle from '../hooks/usePageTitle';
import { supabase } from '../lib/supabase';

export default function Register() {
  usePageTitle('Create account');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [resending, setResending] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    setSent(true); // → show "check your email" state
    setBusy(false);
  };

  const resend = async () => {
    setResending(true);
    setError('');
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
    setResending(false);
  };

  const social = async (provider) => {
    setError('');
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) setError(err.message);
  };

  // "Check your email" state
  if (sent) {
    return (
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 400, alignItems: 'center', textAlign: 'center' }}>
        <MarkEmailReadRoundedIcon sx={{ fontSize: 56, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" component="h1">Confirm your email</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then you'll land in your vault.
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        <Button variant="text" onClick={resend} disabled={resending}>
          {resending ? 'Resending…' : "Didn't get it? Resend"}
        </Button>
        <Link component={RouterLink} to="/login" variant="body2">Back to sign in</Link>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', maxWidth: 400 }}>
      <Box>
        <Typography variant="h4" component="h1">Create your account</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Just an email and password to get started.
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
              autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Stack>
          <Button
            type="submit" variant="contained" disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {busy ? 'Creating…' : 'Create account'}
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
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">Sign in</Link>
      </Typography>
    </Stack>
  );
}