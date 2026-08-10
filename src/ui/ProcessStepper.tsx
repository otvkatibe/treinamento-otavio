import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { TASKS } from '../zeev/tasks';
import type { TaskMetadata } from '../zeev/types';

type StepState = 'current' | 'completed' | 'future' | 'conditional';

export interface ProcessStepperProps {
  currentTask: TaskMetadata;
}

function getStepState(step: TaskMetadata, currentTask: TaskMetadata): StepState {
  if (step.code === currentTask.code) {
    return 'current';
  }
  if (step.conditional) {
    return 'conditional';
  }
  if (step.stepIndex < currentTask.stepIndex) {
    return 'completed';
  }
  return 'future';
}

export function ProcessStepper({
  currentTask,
}: ProcessStepperProps): React.JSX.Element {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const orientation = isCompact ? 'vertical' : 'horizontal';

  return (
    <Stepper
      activeStep={currentTask.stepIndex}
      orientation={orientation}
      aria-label="Progresso do processo"
      data-layout={orientation}
    >
      {TASKS.map((step) => {
        const state = getStepState(step, currentTask);
        const optional = step.conditional ? (
          <Typography component="span" variant="caption" color="text.secondary">
            Condicional
          </Typography>
        ) : undefined;

        return (
          <Step
            key={step.code}
            active={state === 'current'}
            completed={state === 'completed'}
            data-step-code={step.code}
            data-step-state={state}
          >
            <Tooltip title={step.description} placement="top" arrow>
              <StepLabel optional={optional}>{step.label}</StepLabel>
            </Tooltip>
            {isCompact ? (
              <StepContent data-testid={`step-content-${step.code}`}>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepContent>
            ) : null}
          </Step>
        );
      })}
    </Stepper>
  );
}
