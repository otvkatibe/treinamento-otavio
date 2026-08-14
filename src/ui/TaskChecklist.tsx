import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

export interface TaskChecklistProps { items: readonly string[]; }

export function TaskChecklist({ items }: TaskChecklistProps): React.JSX.Element {
  return (
    <List dense disablePadding aria-label="Checklist da etapa" data-zeev-fieb-role="task-checklist">
      {items.map((item) => (
        <ListItem key={item} disableGutters sx={{ py: 0.25 }}>
          <ListItemIcon sx={{ minWidth: 30, color: 'success.main' }}>
            <Box component="span" aria-hidden="true" sx={{ fontSize: 16, fontWeight: 800 }}>✓</Box>
          </ListItemIcon>
          <ListItemText primary={<Typography variant="body2">{item}</Typography>} />
        </ListItem>
      ))}
    </List>
  );
}
