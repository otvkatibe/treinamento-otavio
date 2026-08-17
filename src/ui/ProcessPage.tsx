import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { FormSection, ProcessStepMetadata, StageCode, VisualConfig } from '../zeev/types';
import { EnvironmentBadge } from './EnvironmentBadge';
import { ProcessStepper } from './ProcessStepper';
import { ProcessSummary } from './ProcessSummary';
import { SectionCard } from './SectionCard';
import { TaskChecklist } from './TaskChecklist';
import { TaskGuidance } from './TaskGuidance';
import { TaskHeader } from './TaskHeader';
import { TASK_PRESENTATION } from './process-content';

export interface ProcessPageProps {
  task: ProcessStepMetadata;
  visitedStages: readonly StageCode[];
  sections?: readonly FormSection[];
  environment: VisualConfig['environment'];
  version: string;
}

export function ProcessPage({
  task,
  visitedStages,
  sections = [],
  environment,
  version,
}: ProcessPageProps): React.JSX.Element {
  const presentation = TASK_PRESENTATION[task.code];
  const correctionRouteObserved = visitedStages.includes('T3');

  return (
    <Box
      component="section"
      aria-label="Experiência do processo"
      data-zeev-fieb-role="process-page"
      data-zeev-fieb-stage={task.code}
    >
      <Paper
        component="header"
        variant="outlined"
        data-zeev-fieb-role="process-header"
        sx={{ borderColor: 'divider', borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}
      >
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>Treinamento</Typography>
              <Typography aria-hidden="true" color="text.disabled">/</Typography>
              <Typography variant="caption" color="text.secondary">{presentation.eyebrow}</Typography>
            </Stack>
            <EnvironmentBadge environment={environment} version={version} />
          </Stack>
          <TaskHeader
            task={task}
            correctionRouteObserved={correctionRouteObserved}
            environment={environment}
            version={version}
            hideEnvironment
          />
        </Box>
        <Box data-zeev-fieb-role="process-stepper" sx={{ bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', px: { xs: 2, md: 3 }, py: 2 }}>
          <ProcessStepper currentTask={task} visitedStages={visitedStages} />
        </Box>
      </Paper>

      <Box
        data-zeev-fieb-role="process-grid"
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' }, gap: 2, mt: 2 }}
      >
        <Box data-zeev-fieb-role="main-column">
          <Paper
            component="section"
            aria-labelledby="task-content-title"
            variant="outlined"
            data-zeev-fieb-role="task-card"
            sx={{ borderColor: 'divider', borderRadius: 3, p: { xs: 2, md: 2.5 }, boxShadow: 1 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <Box>
                <Typography id="task-content-title" component="h3" variant="h6">Conteúdo da tarefa</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Use os campos e controles nativos apresentados logo abaixo.
                </Typography>
              </Box>
              <Chip label={`${sections.length} seções`} size="small" variant="outlined" />
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 2 }} aria-label="Seções desta etapa">
              {sections.map((section: FormSection) => (
                <Box
                  component="section"
                  key={section.id}
                  aria-label={section.label}
                  data-zeev-fieb-role="field-section"
                  data-zeev-fieb-section={section.label}
                >
                  <Chip label={section.label} size="small" sx={{ bgcolor: 'background.default' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        <Stack component="aside" aria-label="Resumo e orientação" spacing={2} data-zeev-fieb-role="aside-column">
          <SectionCard title="Resumo do processo" roleName="process-summary-card">
            <ProcessSummary task={task} visitedStages={visitedStages} />
          </SectionCard>
          <TaskGuidance presentation={presentation} />
          <SectionCard title="Antes de concluir" roleName="checklist-card">
            <TaskChecklist items={presentation.checklist} />
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}
