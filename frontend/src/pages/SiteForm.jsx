import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { api } from '../api/client';

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

  const [values, setValues] = React.useState(EMPTY);
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(!isEdit);
  const [strength, setStrength] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!isEdit) return;
    api
      .getSite(id)
      .then((site) => {
        setValues({
          site: site.site,
          username: site.username,
          password: site.password,
          note: site.note,
          backup_code: site.backup_code,
        });
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id, isEdit]);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    if (field === 'password') setStrength(null);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await api.generatePassword({ length: 16 });
      setValues((v) => ({ ...v, password: result.password }));
      setStrength(result);
      setShowPassword(true);
    } catch (e) {
      setError(`Couldn't generate a password: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.updateSite(id, values);
      } else {
        await api.createSite(values);
      }
      navigate('/');
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
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
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
                  {strength && (
                    <Chip
                      size="small"
                      color={STRENGTH_COLORS[strength.strength_score]}
                      label={`${STRENGTH_LABELS[strength.strength_score]} · ${strength.crack_time_display} to crack`}
                    />
                  )}
                </Stack>
              </FormGrid>

              <FormGrid size={{ xs: 12 }}>
                <FormLabel htmlFor="backup_code">Backup codes</FormLabel>
                <OutlinedInput
                  id="backup_code"
                  name="backup_code"
                  placeholder={'One code per line, e.g.\nA3F9-K2M7'}
                  size="large"
                  multiline
                  minRows={10}
                  value={values.backup_code}
                  onChange={setField('backup_code')}
                  sx={{ fontFamily: 'monospace' }}
                />
              </FormGrid>

              <FormGrid size={{ xs: 12 }}>
                <FormLabel htmlFor="note">Note</FormLabel>
                <OutlinedInput
                  id="note"
                  name="note"
                  placeholder="Anything worth remembering about this account"
                  size="large"
                  multiline
                  minRows={10}
                  value={values.note}
                  onChange={setField('note')}
                />
              </FormGrid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/')} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save site'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

SiteForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
};
