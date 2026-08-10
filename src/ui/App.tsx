import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { muiTheme } from '../theme/mui-theme';
import type { TaskContext, VisualConfig } from '../zeev/types';
import { EnvironmentBadge } from './EnvironmentBadge';
import { ProcessStepper } from './ProcessStepper';
import { TaskHeader } from './TaskHeader';

export interface AppProps {
  taskContext: TaskContext | null;
  environment?: VisualConfig['environment'];
  version?: string;
}

export function App({
  taskContext,
  environment = 'homologacao',
  version = '0.3.0',
}: AppProps): React.JSX.Element {
  const task = taskContext?.metadata ?? null;

  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={muiTheme}>
        <ScopedCssBaseline>
          <Box data-zeev-fieb-island="true" sx={{ mb: 2 }}>
            {task ? (
              <Paper
                component="section"
                aria-label="Contexto do processo"
                variant="outlined"
                sx={{
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                }}
              >
                <Stack spacing={2.5}>
                  <TaskHeader
                    task={task}
                    environment={environment}
                    version={version}
                  />
                  <ProcessStepper currentTask={task} />
                </Stack>
              </Paper>
            ) : (
              <Paper
                component="section"
                aria-label="Contexto do processo"
                variant="outlined"
                sx={{ borderColor: 'divider', borderRadius: 2, p: 2 }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    variantMapping={{ subtitle1: 'h2' }}
                    sx={{ fontWeight: 600 }}
                  >
                    Etapa não identificada
                  </Typography>
                  <EnvironmentBadge environment={environment} version={version} />
                </Stack>
              </Paper>
            )}
          </Box>
        </ScopedCssBaseline>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
