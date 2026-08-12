import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { PROCESS_STEPS } from '../zeev/steps';
import type { ProcessStepMetadata, VisualConfig } from '../zeev/types';
import { EnvironmentBadge } from './EnvironmentBadge';
import { TaskStatus } from './TaskStatus';

export interface TaskHeaderProps {
  task: ProcessStepMetadata;
  correctionRouteObserved?: boolean;
  environment: VisualConfig['environment'];
  version: string;
}

export function TaskHeader({
  task,
  correctionRouteObserved = false,
  environment,
  version,
}: TaskHeaderProps): React.JSX.Element {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            variantMapping={{ h5: 'h2' }}
            sx={{ fontWeight: 700 }}
          >
            {task.heading}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {task.description}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: 'wrap' }}
        >
          <TaskStatus
            task={task}
            totalSteps={PROCESS_STEPS.length}
            correctionRouteObserved={correctionRouteObserved}
          />
          <EnvironmentBadge environment={environment} version={version} />
        </Stack>
      </Stack>
      <Divider />
    </Stack>
  );
}
