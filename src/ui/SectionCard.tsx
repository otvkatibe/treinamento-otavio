import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export interface SectionCardProps {
  title: string;
  children: ReactNode;
  roleName?: string;
}

export function SectionCard({ title, children, roleName }: SectionCardProps): React.JSX.Element {
  return (
    <Paper
      component="section"
      variant="outlined"
      data-zeev-fieb-role={roleName ?? 'section-card'}
      sx={{ borderColor: 'divider', borderRadius: 2, p: 2, boxShadow: 1 }}
    >
      <Stack spacing={1.25}>
        <Typography component="h3" variant="subtitle1">{title}</Typography>
        {children}
      </Stack>
    </Paper>
  );
}
