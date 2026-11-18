import * as React from 'react';
import Accordion from '@tecton-mui/ui/Accordion';
import AccordionDetails from '@tecton-mui/ui/AccordionDetails';
import AccordionSummary from '@tecton-mui/ui/AccordionSummary';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';

export default function ControlledAccordion() {
  const [expanded, setExpanded] = React.useState<string | false>('step1');
  const toggle = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) =>
    setExpanded(isExpanded ? panel : false);
  return (
    <div style={{ width: '100%' }}>
      {['step1', 'step2', 'step3'].map((panel, index) => (
        <Accordion
          key={panel}
          expanded={expanded === panel}
          onChange={toggle(panel)}
          activated={expanded === panel}
        >
          <AccordionSummary expandIcon={<Icon name="chevron-down" />}>
            <Typography component="span">Step {index + 1}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">Only one step is open at a time.</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
