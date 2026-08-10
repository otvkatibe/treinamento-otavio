import Chip from '@mui/material/Chip';

import type { VisualConfig } from '../zeev/types';

export interface EnvironmentBadgeProps {
  environment: VisualConfig['environment'];
  version: string;
}

function environmentLabel(environment: VisualConfig['environment']): string {
  return environment === 'producao' ? 'Produção' : 'Homologação';
}

export function EnvironmentBadge({
  environment,
  version,
}: EnvironmentBadgeProps): React.JSX.Element {
  return (
    <Chip
      label={`${environmentLabel(environment)} • v${version}`}
      size="small"
      color="primary"
      variant="outlined"
    />
  );
}
