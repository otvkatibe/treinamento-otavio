import Chip from '@mui/material/Chip';

export interface TaskStatusProps {
  stepIndex: number;
  totalSteps: number;
}

export function TaskStatus({
  stepIndex,
  totalSteps,
}: TaskStatusProps): React.JSX.Element {
  return (
    <Chip
      label={`Etapa ${stepIndex + 1} de ${totalSteps}`}
      size="small"
      color="primary"
    />
  );
}
