import Accordion from '@tecton-mui/ui/Accordion';
import AccordionSummary from '@tecton-mui/ui/AccordionSummary';
import AccordionDetails from '@tecton-mui/ui/AccordionDetails';
import Typography from '@tecton-mui/ui/Typography';
import Icon from '@tecton-mui/ui/Icon';

const sections = [
  { id: 'general', title: 'General', body: 'Name, owner and description of the project.' },
  { id: 'units', title: 'Units', body: 'Depth in meters, pressure in bar, temperature in °C.' },
  { id: 'sharing', title: 'Sharing', body: 'Visible to the exploration team. Editors: 3.' },
];

export default function BasicAccordion() {
  return (
    <div style={{ width: '100%' }}>
      {sections.map((section, index) => (
        <Accordion key={section.id} defaultExpanded={index === 0}>
          <AccordionSummary
            expandIcon={<Icon name="chevron-down" />}
            aria-controls={`${section.id}-content`}
            id={`${section.id}-header`}
          >
            <Typography component="span">{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">{section.body}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
