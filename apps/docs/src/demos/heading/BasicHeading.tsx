import Box from '@tecton-mui/ui/Box';
import Button from '@tecton-mui/ui/Button';
import Icon from '@tecton-mui/ui/Icon';
import Heading, { HeadingActions, HeadingTitle } from '@tecton-mui/ui/Heading';

export default function BasicHeading() {
  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <HeadingTitle>Workspaces</HeadingTitle>
        <HeadingActions>
          <Button variant="contained" startIcon={<Icon name="add" />}>
            New Workspace
          </Button>
        </HeadingActions>
      </Heading>
    </Box>
  );
}
