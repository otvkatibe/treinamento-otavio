import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PROCESS_STEPS } from '../zeev/steps';
import type { ProcessStepMetadata, StageCode } from '../zeev/types';

export interface ProcessSummaryProps {
  task: ProcessStepMetadata;
  visitedStages: readonly StageCode[];
}

export function ProcessSummary({ task, visitedStages }: ProcessSummaryProps): React.JSX.Element {
  const progress = ((task.stepIndex + 1) / PROCESS_STEPS.length) * 100;
  const visitedLabels = PROCESS_STEPS
    .filter((step) => visitedStages.includes(step.code))
    .map((step) => step.code === 'START' ? 'START' : step.code.replace('T', 'T0'));

  return (
    <Stack spacing={1.5} data-zeev-fieb-role="process-summary">
      <Box>
        <Typography variant="caption" color="text.secondary">Etapa atual</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{task.heading}</Typography>
      </Box>
      <Box>
        <Stack direction="row" sx={{ mb: 0.75, justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Progresso visual</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{task.stepIndex + 1} de {PROCESS_STEPS.length}</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} aria-label={`${Math.round(progress)}% do fluxo visual`} sx={{ height: 7, borderRadius: 999 }} />
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">Etapas visitadas</Typography>
        <Typography variant="body2">{visitedLabels.length > 0 ? visitedLabels.join(' · ') : 'Etapa atual'}</Typography>
      </Box>
    </Stack>
  );
}
