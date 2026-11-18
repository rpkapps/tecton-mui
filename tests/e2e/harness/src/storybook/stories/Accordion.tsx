// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary as AccordionSummary_a,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@tecton-mui/ui';

const a = (
  <Stack spacing={1}>
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2">Net production</Typography>
      <Typography variant="body2">58.3 mboepd</Typography>
    </Stack>
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2">Hub efficiency</Typography>
      <Typography variant="body2">88%</Typography>
    </Stack>
  </Stack>
);
const R = (
  <Stack spacing={1}>
    <LinearProgress variant="determinate" value={98} />
    <Typography variant="body2">9.8 kboe (98%)</Typography>
    <Typography variant="body2">28.4 mmboe · Remaining reserves</Typography>
    <Typography variant="body2">Years left · 4+</Typography>
  </Stack>
);
function CO({ label: d, disabled: i, defaultExpanded: s, body: c, activated: r, withIcons: p }) {
  return (
    <Accordion disabled={i} defaultExpanded={s} activated={r}>
      <AccordionSummary_a>
        {p ? (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ width: '100%', minWidth: 0, alignItems: 'center' }}
          >
            <span
              className="tecton-cube-outline"
              style={{
                fontSize: 'var(--tecton-icon-size-150)',
                width: 'var(--tecton-icon-size-150)',
                height: 'var(--tecton-icon-size-150)',
                flexShrink: 0,
              }}
              aria-hidden
            />
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 'var(--tecton-font-size-medium)',
                lineHeight: 'var(--tecton-line-height-medium)',
                fontWeight: 'var(--tecton-font-weight-medium-action)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {d}
            </Typography>
            {[
              { name: 'lock-outline', label: 'Lock' },
              { name: 'settings-outline', label: 'Settings' },
              { name: 'open-in-new-outline', label: 'Open' },
            ].map((v) => (
              <IconButton
                key={v.label}
                aria-label={v.label}
                color="inherit"
                component="span"
                sx={{
                  padding: 0,
                  width: 'var(--tecton-icon-size-100)',
                  height: 'var(--tecton-icon-size-100)',
                  color: 'var(--tecton-color-action-tertiary-adornment)',
                  flexShrink: 0,
                }}
              >
                <span
                  className={`tecton-${v.name}`}
                  style={{
                    fontSize: 'var(--tecton-icon-size-100)',
                    width: 'var(--tecton-icon-size-100)',
                    height: 'var(--tecton-icon-size-100)',
                  }}
                  aria-hidden
                />
              </IconButton>
            ))}
          </Stack>
        ) : (
          <Typography
            sx={{
              fontSize: 'var(--tecton-font-size-medium)',
              lineHeight: 'var(--tecton-line-height-medium)',
              fontWeight: 'var(--tecton-font-weight-medium-action)',
            }}
          >
            {d}
          </Typography>
        )}
      </AccordionSummary_a>
      {c ? <AccordionDetails>{c}</AccordionDetails> : null}
    </Accordion>
  );
}
function StandardCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Enabled: collapsed and expanded
        </Typography>
        <CO label="Accordion Label" body={a} />
        <CO label="Accordion Label" defaultExpanded body={a} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="h6">Group of accordions: Dividers axis</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Without dividers: stacked seamlessly
        </Typography>
        <Stack spacing={0.5}>
          <CO label="Accordion Label" body={a} />
          <CO label="Accordion Label" defaultExpanded body={a} />
          <CO label="Accordion Label" body={a} />
        </Stack>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          With dividers: horizontal rule between rows
        </Typography>
        <Stack spacing={0}>
          <Divider />
          <CO label="Accordion Label" body={a} />
          <Divider />
          <CO label="Accordion Label" defaultExpanded body={a} />
          <Divider />
          <CO label="Accordion Label" body={a} />
          <Divider />
        </Stack>
      </Stack>
    </Stack>
  );
}
function ActivatedCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Activated (Tecton state)
      </Typography>
      <CO label="Accordion Label" activated body={a} />
      <CO label="Accordion Label" activated defaultExpanded body={R} />
    </Stack>
  );
}
function DisabledCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Disabled
      </Typography>
      <CO label="Accordion Label" disabled body={a} />
      <CO label="Accordion Label" disabled defaultExpanded body={a} />
    </Stack>
  );
}
function ExamplesCanvas() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Enabled: with leading icon + action buttons
        </Typography>
        <CO label="Accordion Label" withIcons body={a} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Disabled
        </Typography>
        <CO label="Accordion Label" withIcons disabled body={a} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Expanded: chevron flipped, body visible
        </Typography>
        <CO label="Accordion Label" withIcons defaultExpanded body={a} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Active Expanded: tinted header + progress body
        </Typography>
        <CO label="Accordion Label" withIcons defaultExpanded activated body={R} />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Group without dividers: 4 rows, one expanded + activated
        </Typography>
        <Stack spacing={0.5}>
          <CO label="Accordion Label" body={a} />
          <CO label="Accordion Label" defaultExpanded activated body={a} />
          <CO label="Accordion Label" body={a} />
          <CO label="Accordion Label" body={a} />
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Group with dividers: horizontal rule between each row
        </Typography>
        <Stack spacing={0}>
          <Divider />
          <CO label="Accordion Label" body={a} />
          <Divider />
          <CO label="Accordion Label" defaultExpanded body={a} />
          <Divider />
          <CO label="Accordion Label" body={a} />
          <Divider />
          <CO label="Accordion Label" body={a} />
          <Divider />
        </Stack>
      </Stack>
    </Stack>
  );
}
const je = { title: 'Molecules/Accordion', component: Accordion };
const Story_Standard = { name: 'Standard', render: () => <StandardCanvas /> };
const Story_Activated = { name: 'Activated', render: () => <ActivatedCanvas /> };
const Story_Disabled = { name: 'Disabled', render: () => <DisabledCanvas /> };
const Story_Examples = { render: () => <ExamplesCanvas /> };
const Story_Playground = {
  name: 'Playground',
  args: {
    expanded: false,
    disabled: false,
    activated: false,
    summaryText: 'Accordion Label',
    detailsText: 'Body content',
  },
  render: (d) => (
    <Stack sx={{ p: 3, alignItems: 'stretch' }}>
      <Accordion expanded={d.expanded} disabled={d.disabled} activated={d.activated}>
        <AccordionSummary_a>{d.summaryText}</AccordionSummary_a>
        <AccordionDetails>{d.detailsText}</AccordionDetails>
      </Accordion>
    </Stack>
  ),
};

export const meta = je;
export const stories = {
  'molecules-accordion--activated': Story_Activated,
  'molecules-accordion--disabled': Story_Disabled,
  'molecules-accordion--examples': Story_Examples,
  'molecules-accordion--playground': Story_Playground,
  'molecules-accordion--standard': Story_Standard,
};
