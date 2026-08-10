import { createTheme } from '@mui/material/styles';

import { tokens } from './tokens';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: tokens.color.primary,
      dark: tokens.color.primaryDark,
      light: tokens.color.primaryLight,
    },
    background: {
      default: tokens.color.background,
      paper: tokens.color.surface,
    },
    text: {
      primary: tokens.color.text,
      secondary: tokens.color.muted,
    },
    divider: tokens.color.border,
  },
  shape: {
    borderRadius: tokens.radius.medium,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});
