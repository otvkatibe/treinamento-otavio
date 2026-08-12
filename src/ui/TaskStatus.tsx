import Chip from '@mui/material/Chip';

import type { ProcessStepMetadata } from '../zeev/types';

export interface TaskStatusProps {
  task: ProcessStepMetadata;
  totalSteps: number;
  correctionRouteObserved?: boolean;
}

function statusLabel(
  task: ProcessStepMetadata,
  totalSteps: number,
  correctionRouteObserved: boolean,
): string {
  const position = `Etapa ${task.stepIndex + 1} de ${totalSteps}`;

  if (task.code === 'START') {
    return `${position} • Início do processo`;
  }
  if (task.code === 'T3') {
    return `${position} • Rota condicional`;
  }
  if (task.code === 'T5') {
    return `${position} • Decisão final`;
  }
  if (task.code === 'T2' && correctionRouteObserved) {
    return `${position} • Revalidação`;
  }
  return position;
}

export function TaskStatus({
  task,
  totalSteps,
  correctionRouteObserved = false,
}: TaskStatusProps): React.JSX.Element {
  return (
    <Chip
      label={statusLabel(task, totalSteps, correctionRouteObserved)}
      size="small"
      color="primary"
    />
  );
}
