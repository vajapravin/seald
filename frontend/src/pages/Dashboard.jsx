import * as React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { api } from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sites, setSites] = React.useState(null);
  const [error, setError] = React.useState('');
  const [revealed, setRevealed] = React.useState({});
  const [toDelete, setToDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);
  const [snack, setSnack] = React.useState('');

  const load = React.useCallback(() => {
    setError('');
    api
      .listSites()
      .then(setSites)
      .catch((e) => {
        setSites([]);
        setError(e.message);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const copyPassword = async (site) => {
    try {
      await navigator.clipboard.writeText(site.password);
      setSnack(`Password for ${site.site} copied`);
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

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Your vault
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {sites ? `${sites.length} site${sites.length === 1 ? '' : 's'} saved` : 'Loading…'}
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
      ) : sites.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} sx={{ alignItems: 'center', py: 6, textAlign: 'center' }}>
              <LockOpenRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6">Your vault is empty</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                Save your first site to keep its password and backup codes in one sealed place.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/sites/new" startIcon={<AddRoundedIcon />}>
                Add your first site
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Site</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Password</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{site.site}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{site.username}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {revealed[site.id] ? site.password : '••••••••'}
                      </Typography>
                      <Tooltip title={revealed[site.id] ? 'Hide password' : 'Show password'}>
                        <IconButton
                          size="small"
                          onClick={() => setRevealed((r) => ({ ...r, [site.id]: !r[site.id] }))}
                        >
                          {revealed[site.id] ? (
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
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit site">
                      <IconButton size="small" onClick={() => navigate(`/sites/${site.id}/edit`)}>
                        <EditRoundedIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove site">
                      <IconButton size="small" color="error" onClick={() => setToDelete(site)}>
                        <DeleteOutlineRoundedIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
        <DialogTitle>Remove {toDelete?.site}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This deletes the saved password and backup codes for {toDelete?.site}. This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
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
