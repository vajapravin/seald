import * as React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import AppTheme from './shared-theme/AppTheme';
import ColorModeIconDropdown from './shared-theme/ColorModeIconDropdown';
import SealdIcon from './components/SealdIcon';
import Dashboard from './pages/Dashboard';
import SiteForm from './pages/SiteForm';

export default function App(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1200 }}>
        <ColorModeIconDropdown />
      </Box>
      <Container maxWidth="md" sx={{ pt: { xs: 6, sm: 8 }, pb: 8 }}>
        <Stack spacing={4}>
          <Link component={RouterLink} to="/" sx={{ alignSelf: 'flex-start' }}>
            <SealdIcon />
          </Link>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites/new" element={<SiteForm mode="create" />} />
            <Route path="/sites/:id/edit" element={<SiteForm mode="edit" />} />
          </Routes>
        </Stack>
      </Container>
    </AppTheme>
  );
}
