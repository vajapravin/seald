import * as React from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import AppTheme from './shared-theme/AppTheme';
import ColorModeIconDropdown from './shared-theme/ColorModeIconDropdown';
import SealdLogo from './components/SealdLogo';
import VaultSummary from './components/VaultSummary';
import Dashboard from './pages/Dashboard';
import SiteForm from './pages/SiteForm';

export default function App(props) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1200 }}>
        <ColorModeIconDropdown />
      </Box>

      <Grid
        container
        sx={{
          height: { xs: '100%', sm: 'calc(100dvh - var(--template-frame-height, 0px))' },
          mt: { xs: 4, sm: 0 },
        }}
      >
        {/* Left panel — brand + vault summary (template: background.paper) */}
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: 500,
            }}
          >
            <VaultSummary />
          </Box>
        </Grid>

        {/* Right panel — routed pages (template: background.default) */}
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
          {/* Compact brand header on mobile, where the left panel is hidden */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Link component={RouterLink} to="/" sx={{ lineHeight: 0 }}>
              <SealdLogo height={56} />
            </Link>
          </Box>

          <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: 700 } }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sites/new" element={<SiteForm mode="create" />} />
              <Route path="/sites/:id/edit" element={<SiteForm mode="edit" />} />
            </Routes>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
