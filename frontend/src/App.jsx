import * as React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AppTheme from './shared-theme/AppTheme';
import ColorModeIconDropdown from './shared-theme/ColorModeIconDropdown';
import SealdLogo from './components/SealdLogo';
import VaultSummary from './components/VaultSummary';
import ProtectedRoute from './components/ProtectedRoute';
import { VaultProvider } from './context/VaultContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import SiteForm from './pages/SiteForm';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Button from '@mui/material/Button';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Stack from '@mui/material/Stack';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// Left panel shows vault health only when signed in; otherwise a neutral tagline.
function LeftPanel() {
  const { session, signOut } = useAuth();
  return (
    <Grid
      size={{ xs: 12, sm: 5, lg: 4 }}
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        backgroundColor: 'background.paper',
        borderRight: { sm: 'none', md: '1px solid' },
        borderColor: { sm: 'none', md: 'divider' },
        alignItems: 'start',
        pt: 16,
        px: 10,
        gap: 4,
      }}
    >
      <Link component={RouterLink} to="/" sx={{ lineHeight: 0 }}>
        <SealdLogo height={110} />
      </Link>
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%', maxWidth: 500 }}>
        {session ? (
          <VaultSummary />
        ) : (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your passwords and backup codes — encrypted, self-hosted, yours.
          </Typography>
        )}
      </Box>

      {/* Sign out pinned to the bottom, only when logged in */}
      {session && (
        <Stack spacing={3} sx={{ width: '100%', maxWidth: 400, pb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={signOut}
          >
            Sign out
          </Button>
        </Stack>
      )}
    </Grid>
  );
}

function Layout({ children }) {
  return (
    <Grid
      container
      sx={{
        height: { xs: '100%', sm: 'calc(100dvh - var(--template-frame-height, 0px))' },
        mt: { xs: 4, sm: 0 },
      }}
    >
      <LeftPanel />
      <Grid
        size={{ sm: 12, md: 7, lg: 8 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          width: '100%',
          backgroundColor: { xs: 'transparent', sm: 'background.default' },
          alignItems: 'start',
          pt: { xs: 4, sm: 10 },
          px: { xs: 2, sm: 10 },
          pb: 6,
          gap: 4,
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Link component={RouterLink} to="/" sx={{ lineHeight: 0 }}>
            <SealdLogo height={56} />
          </Link>
        </Box>
        <Box sx={{ width: '100%' }}>{children}</Box>
      </Grid>
    </Grid>
  );
}

export default function App(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1200 }}>
        <ColorModeIconDropdown />
      </Box>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Layout><Login /></Layout>
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Layout><Register /></Layout>
              </PublicOnlyRoute>
            }
          />
          <Route path="/auth/callback" element={<Layout><AuthCallback /></Layout>} />

          {/* Protected app routes — VaultProvider only wraps the authenticated area */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <VaultProvider>
                  <Layout><Dashboard /></Layout>
                </VaultProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites/new"
            element={
              <ProtectedRoute>
                <VaultProvider>
                  <Layout><SiteForm mode="create" /></Layout>
                </VaultProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sites/:id/edit"
            element={
              <ProtectedRoute>
                <VaultProvider>
                  <Layout><SiteForm mode="edit" /></Layout>
                </VaultProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </AppTheme>
  );
}