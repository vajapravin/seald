import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import Box from '@mui/material/Box';

export default function SealdIcon() {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <LockRoundedIcon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.02em' }}>
        Seald
      </Typography>
    </Stack>
  );
}
