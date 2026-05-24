import * as React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import PropTypes from 'prop-types';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import OutlinedInput from '@mui/material/OutlinedInput';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { api } from '../api/client';
import { useVault } from '../context/VaultContext';

const zxcvbnInstance = new ZxcvbnFactory({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLORS = ['error', 'error', 'warning', 'success', 'success'];

const EMPTY = { site: '', username: '', password: '', note: '', backup_code: '' };

export default function SiteForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';
  const { load } = useVault();

  const [values, setValues] = React.useState(EMPTY);
  const [initial, setInitial] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [genCodes, setGenCodes] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(!isEdit);
  const [error, setError] = React.useState('');
  
  usePageTitle(isEdit ? `Edit ${values.site || 'site'}` : 'Add site');

  // Generator options
  const [length, setLength] = React.useState(16);
  const [useSymbols, setUseSymbols] = React.useState(true);

  React.useEffect(() => {
    if (!isEdit) return;
    api
      .getSite(id)
      .then((site) => {
        const loaded = {
          site: site.site,
          username: site.username,
          password: site.password,
          note: site.note,
          backup_code: site.backup_code,
        };
        setValues(loaded);
        setInitial(loaded);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id, isEdit]);

  // Dirty detection: any field differs from what we started with.
  const isDirty = React.useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial],
  );

  // Live strength: recompute from the value on every change (client-side zxcvbn).
  const strength = React.useMemo(() => {
    if (!values.password) return null;
    const result = zxcvbnInstance.check(values.password);
    return {
      score: result.score,
      crack: result.crackTimes.offlineSlowHashingXPerSecond.display,
    };
  }, [values.password]);

  // Block in-app navigation while there are unsaved changes (and not mid-save).
  const blocker = useBlocker(
    React.useCallback(
      () => isDirty && !saving,
      [isDirty, saving],
    ),
  );

  // Native browser prompt for tab close / refresh.
  React.useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const setField = (field) => (event) => {
    const { value } = event.target;
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await api.generatePassword({
        length,
        use_symbols: useSymbols,
      });
      setValues((v) => ({ ...v, password: result.password }));
      setShowPassword(true);
    } catch (e) {
      setError(`Couldn't generate a password: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateCodes = async () => {
    setGenCodes(true);
    setError('');
    try {
      const result = await api.generateBackupCodes(10);
      setValues((v) => ({ ...v, backup_code: result.codes.join('\n') }));
    } catch (e) {
      setError(`Couldn't generate backup codes: ${e.message}`);
    } finally {
      setGenCodes(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.updateSite(id, values);
        load();
        navigate('/', { state: { toast: `${values.site} updated` } });
      } else {
        await api.createSite(values);
        load();
        navigate('/', { state: { toast: `${values.site} saved to your vault` } });
      }
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={() => navigate('/')}
          variant="text"
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        >
          Back to vault
        </Button>
        <Typography variant="h4" component="h1">
          {isEdit ? `Edit ${values.site || 'site'}` : 'Add a site'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {isEdit
            ? 'Update the saved credentials for this site.'
            : 'Save a site with its password and backup codes.'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="site" required>
                  Site
                </FormLabel>
                <OutlinedInput
                  id="site"
                  name="site"
                  type="text"
                  placeholder="github.com"
                  required
                  size="small"
                  value={values.site}
                  onChange={setField('site')}
                />
              </FormGrid>

              <FormGrid size={{ xs: 12, md: 6 }}>
                <FormLabel htmlFor="username" required>
                  Username
                </FormLabel>
                <OutlinedInput
                  id="username"
                  name="username"
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                  size="small"
                  value={values.username}
                  onChange={setField('username')}
                />
              </FormGrid>

              <FormGrid size={{ xs: 12 }}>
                <FormLabel htmlFor="password" required>
                  Password
                </FormLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter or generate a password"
                  required
                  size="small"
                  value={values.password}
                  onChange={setField('password')}
                  sx={{ fontFamily: 'monospace' }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        size="small"
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon fontSize="inherit" />
                        ) : (
                          <VisibilityRoundedIcon fontSize="inherit" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />

                {/* Live strength meter — shows for typed AND generated passwords */}
                {strength && (
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(strength.score + 1) * 20}
                      color={STRENGTH_COLORS[strength.score]}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Chip
                      size="small"
                      color={STRENGTH_COLORS[strength.score]}
                      variant="outlined"
                      label={`${STRENGTH_LABELS[strength.score]} · ${strength.crack} to crack`}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </Stack>
                )}

                {/* Generator + inline options */}
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      generating ? <CircularProgress size={14} /> : <AutorenewRoundedIcon />
                    }
                    onClick={handleGenerate}
                    disabled={generating}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {generating ? 'Generating…' : 'Generate new password'}
                  </Button>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: { sm: 'center' }, maxWidth: 460 }}
                  >
                    <Stack sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Length: {length}
                      </Typography>
                      <Slider
                        size="small"
                        value={length}
                        min={8}
                        max={64}
                        onChange={(_, v) => setLength(v)}
                        valueLabelDisplay="auto"
                      />
                    </Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={useSymbols}
                          onChange={(e) => setUseSymbols(e.target.checked)}
                        />
                      }
                      label="Symbols"
                    />
                  </Stack>
                </Stack>
              </FormGrid>

              <FormGrid size={{ xs: 12 }}>
                <FormLabel htmlFor="backup_code">Backup codes</FormLabel>
                <OutlinedInput
                  id="backup_code"
                  name="backup_code"
                  placeholder={'One code per line, e.g.\nA3F9-K2M7'}
                  multiline
                  minRows={6}
                  value={values.backup_code}
                  onChange={setField('backup_code')}
                  sx={{ fontFamily: 'monospace' }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={genCodes ? <CircularProgress size={14} /> : <KeyRoundedIcon />}
                  onClick={handleGenerateCodes}
                  disabled={genCodes}
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  {genCodes ? 'Generating…' : 'Generate backup codes'}
                </Button>
              </FormGrid>

              <FormGrid size={{ xs: 12 }}>
                <FormLabel htmlFor="note">Note</FormLabel>
                <OutlinedInput
                  id="note"
                  name="note"
                  placeholder="Anything worth remembering about this account"
                  multiline
                  minRows={4}
                  value={values.note}
                  onChange={setField('note')}
                />
              </FormGrid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/')} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save site'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Unsaved-changes confirmation (in-app navigation) */}
      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()}>
        <DialogTitle>Discard unsaved changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes to this site. If you leave now, they'll be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => blocker.reset?.()}>Keep editing</Button>
          <Button color="error" variant="contained" onClick={() => blocker.proceed?.()}>
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

SiteForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
};