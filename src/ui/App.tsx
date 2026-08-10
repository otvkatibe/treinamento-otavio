import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { muiTheme } from '../theme/mui-theme';

export interface AppProps {
  children?: ReactNode;
}

export function App({ children = null }: AppProps) {
  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={muiTheme}>
        <ScopedCssBaseline>{children}</ScopedCssBaseline>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
