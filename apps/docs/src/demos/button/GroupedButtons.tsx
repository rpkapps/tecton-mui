import Button from '@tecton-mui/ui/Button';
import ButtonGroup from '@tecton-mui/ui/ButtonGroup';

export default function GroupedButtons() {
  return (
    <ButtonGroup variant="outlined" aria-label="Alignment">
      <Button>Left</Button>
      <Button>Center</Button>
      <Button>Right</Button>
    </ButtonGroup>
  );
}
