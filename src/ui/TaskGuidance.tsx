import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import type { TaskPresentation } from './process-content';

export interface TaskGuidanceProps {
  presentation: TaskPresentation;
}

export function TaskGuidance({ presentation }: TaskGuidanceProps): React.JSX.Element {
  const severity = presentation.tone === 'warning' ? 'warning' : 'info';
  return (
    <Alert severity={severity} variant="outlined" data-zeev-fieb-role="task-guidance">
      <AlertTitle>Orientação desta etapa</AlertTitle>
      {presentation.guidance}
    </Alert>
  );
}
