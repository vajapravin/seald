import * as React from 'react';
import Box from '@mui/material/Box';
import logo from '../assets/seald-logo.png';

export default function SealdLogo({ height = 96 }) {
  return (
    <Box
      component="img"
      src={logo}
      alt="Seald"
      sx={{ height, width: 'auto', display: 'block' }}
    />
  );
}
