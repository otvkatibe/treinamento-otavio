import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { muiTheme } from '../theme/mui-theme';
import type { FormSection, ProcessStepContext, StageCode, VisualConfig } from '../zeev/types';
import { EnvironmentBadge } from './EnvironmentBadge';
import { ProcessPage } from './ProcessPage';

export interface AppProps {
  taskContext: ProcessStepContext | null;
  visitedStages?: readonly StageCode[];
  sections?: readonly FormSection[];
  environment?: VisualConfig['environment'];
  version?: string;
}

export function App({
  taskContext,
  visitedStages = [],
  sections = [],
  environment = 'homologacao',
  version = '0.4.0-rc.3',
}: AppProps): React.JSX.Element {
  const task = taskContext?.metadata ?? null;

  return (
    <StyledEngineProvider enableCssLayer>
      <ThemeProvider theme={muiTheme}>
        <ScopedCssBaseline>
          <Box
            data-zeev-fieb-island="true"
            data-zeev-fieb-task-known={task ? 'true' : 'false'}
            data-zeev-fieb-stage={task?.code ?? 'unknown'}
            sx={{ mb: 2 }}
          >
            {task ? (
              <ProcessPage
                task={task}
                visitedStages={visitedStages}
                sections={sections}
                environment={environment}
                version={version}
              />
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
