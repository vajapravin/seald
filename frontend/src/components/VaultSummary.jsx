import * as React from 'react';
import { useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { api } from '../api/client';

export default function VaultSummary() {
  const location = useLocation();
  const [count, setCount] = React.useState(null);

  // Refresh the count whenever the route changes (e.g. after saving a site)
  React.useEffect(() => {
    let active = true;
    api
      .listSites()
      .then((sites) => active && setCount(sites.length))
      .catch(() => active && setCount(null));
    return () => {
      active = false;
    };
  }, [location.pathname]);

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total sites
      </Typography>
      <Typography variant="h4" gutterBottom>
        {count === null ? '—' : count}
      </Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            sx={{ mr: 2 }}
            primary="Vault"
            secondary="Passwords & backup codes, encrypted at rest"
          />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {count === null ? '—' : count}
          </Typography>
        </ListItem>
        {/* Future summary rows: weak passwords, sites missing backup codes, … */}
      </List>
    </React.Fragment>
  );
}
