import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useVault } from '../context/VaultContext';
import { computeVaultHealth } from '../lib/vaultHealth';

function HealthRow({ label, value, danger }) {
  return (
    <ListItem sx={{ py: 0.75, px: 0 }}>
      <ListItemText primary={label} />
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, color: danger && value > 0 ? 'error.main' : 'text.primary' }}
      >
        {value}
      </Typography>
    </ListItem>
  );
}

export default function VaultSummary() {
  const vault = useVault();
  const sites = vault?.sites;
  const health = React.useMemo(() => computeVaultHealth(sites), [sites]);
  const ready = Array.isArray(sites);

  const scoreColor =
    health.score === null ? 'inherit'
    : health.score >= 80 ? 'success.main'
    : health.score >= 50 ? 'warning.main'
    : 'error.main';

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total sites
      </Typography>
      <Typography variant="h4" gutterBottom>
        {ready ? health.total : '—'}
      </Typography>

      {ready && health.total > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Vault health
          </Typography>
          <Typography variant="h4" sx={{ color: scoreColor, mb: 0.5 }}>
            {health.score}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={health.score}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      )}

      <List disablePadding>
        <HealthRow label="Weak passwords" value={health.weak} danger />
        <HealthRow label="Reused passwords" value={health.reused} danger />
        <HealthRow label="No backup codes" value={health.noBackup} danger />
      </List>
    </React.Fragment>
  );
}