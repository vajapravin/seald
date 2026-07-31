import * as React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  DataGrid,
  GridToolbarQuickFilter,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { api } from '../api/client';
import { useVault } from '../context/VaultContext';

// Relative "3 days ago" via the platform — no date library dependency.
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const DIVISIONS = [
  { amount: 60, unit: 'seconds' },
  { amount: 60, unit: 'minutes' },
  { amount: 24, unit: 'hours' },
  { amount: 7, unit: 'days' },
  { amount: 4.34524, unit: 'weeks' },
  { amount: 12, unit: 'months' },
  { amount: Number.POSITIVE_INFINITY, unit: 'years' },
];

function relativeTime(iso) {
  if (!iso) return '';
  let duration = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return '';
}

function QuickSearchToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1.5, pb: 1, justifyContent: 'flex-start' }}>
      <GridToolbarQuickFilter
        placeholder="Search sites or usernames…"
        sx={{ width: { xs: '100%', sm: 320 } }}
      />
    </GridToolbarContainer>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sites, error, load, setError } = useVault();
  const [revealed, setRevealed] = React.useState({});
  const [toDelete, setToDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [snack, setSnack] = React.useState('');
  usePageTitle('Your vault');

  React.useEffect(() => {
    if (location.state?.toast) {
      setSnack(location.state.toast);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const copyPassword = async (site) => {
    try {
      await navigator.clipboard.writeText(site.password);
      setSnack(`Password for ${site.site} copied`);
    } catch {
      setSnack('Copy failed — your browser blocked clipboard access');
    }
  };

  const copyUsername = async (site) => {
    try {
      await navigator.clipboard.writeText(site.username);
      setSnack(`Username for ${site.site} copied`);
    } catch {
      setSnack('Copy failed — your browser blocked clipboard access');
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteSite(toDelete.id);
      setSnack(`${toDelete.site} removed`);
      setToDelete(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = React.useMemo(
    () => [
      {
        field: 'site',
        headerName: 'Site',
        flex: 1,
        minWidth: 140,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'username',
        headerName: 'Username',
        flex: 1,
        minWidth: 160,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {params.value}
            </Typography>
            <Tooltip title="Copy username">
              <IconButton size="small" onClick={() => copyUsername(params.row)}>
                <ContentCopyRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: 'password',
        headerName: 'Password',
        flex: 1,
        minWidth: 180,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const site = params.row;
          const shown = revealed[site.id];
          return (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {shown ? site.password : '••••••••'}
              </Typography>
              <Tooltip title={shown ? 'Hide password' : 'Show password'}>
                <IconButton
                  size="small"
                  onClick={() =>
                    setRevealed((r) => ({ ...r, [site.id]: !r[site.id] }))
                  }
                >
                  {shown ? (
                    <VisibilityOffRoundedIcon fontSize="inherit" />
                  ) : (
                    <VisibilityRoundedIcon fontSize="inherit" />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Copy password">
                <IconButton size="small" onClick={() => copyPassword(site)}>
                  <ContentCopyRoundedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        field: 'updated_at',
        headerName: 'Updated',
        width: 130,
        renderCell: (params) => (
          <Tooltip title={params.value ? new Date(params.value).toLocaleString() : ''}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {relativeTime(params.value)}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        sortable: false,
        filterable: false,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => {
          const site = params.row;
          const hasNote = Boolean(site.note?.trim());
          return (
            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
              {hasNote && (
                <Tooltip title={site.note}>
                  <IconButton size="small">
                    <StickyNote2OutlinedIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Edit site">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/sites/${site.id}/edit`)}
                >
                  <EditRoundedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Remove site">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setToDelete(site)}
                >
                  <DeleteOutlineRoundedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revealed],
  );

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Your vault
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {Array.isArray(sites)
              ? `${sites.length} site${sites.length === 1 ? '' : 's'} saved`
              : ' '}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => navigate('/sites/new')}
        >
          Add site
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {sites === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sites === undefined ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 6, textAlign: 'center' }}>
              <CloudOffRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6">Can't reach your vault</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380 }}>
                The Seald backend isn't responding. Check that it's running, then try again.
              </Typography>
              <Button variant="contained" onClick={load} startIcon={<RefreshRoundedIcon />}>
                Try again
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : sites.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 6, textAlign: 'center' }}>
              <LockOpenRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6">Your vault is empty</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                Save your first site to keep its password and backup codes in one sealed place.
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to="/sites/new"
                startIcon={<AddRoundedIcon />}
              >
                Add your first site
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <DataGrid
            autoHeight
            rows={sites}
            columns={columns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            disableColumnSelector
            disableDensitySelector
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: 'site', sort: 'asc' }] },
            }}
            showToolbar
            slots={{ toolbar: QuickSearchToolbar }}
            sx={{
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeader': {
                borderRight: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
            }}
          />
        </Card>
      )}

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Remove {toDelete?.site}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This deletes the saved password and backup codes for {toDelete?.site}. This
            can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {deleting ? 'Removing…' : 'Remove site'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={2500}
        onClose={() => setSnack('')}
        message={snack}
      />
    </Stack>
  );
}