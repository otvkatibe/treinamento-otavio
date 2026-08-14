import { createTheme } from '@mui/material/styles';

import { tokens } from './tokens';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: tokens.color.primary,
      dark: tokens.color.primaryDark,
      light: tokens.color.primaryLight,
    },
    success: { main: tokens.color.success },
    warning: { main: tokens.color.warning },
    error: { main: tokens.color.danger },
    background: {
      default: tokens.color.background,
      paper: tokens.color.surface,
    },
    text: {
      primary: tokens.color.text,
      secondary: tokens.color.muted,
      disabled: tokens.color.disabled,
    },
    divider: tokens.color.border,
  },
  shape: { borderRadius: tokens.radius.medium },
  typography: {
    fontFamily: tokens.typography.family,
    h4: { fontSize: 'clamp(1.55rem, 3vw, 2.125rem)', fontWeight: 750, lineHeight: 1.18 },
    h6: { fontWeight: 700, lineHeight: 1.3 },
    subtitle1: { fontWeight: 650 },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: { fontSize: '0.8rem', fontWeight: 600 },
      },
    },
  },
});
