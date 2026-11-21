// Reproduction of the Tecton drop-in Storybook (apps/storybook 1.1.0) "Drop-ins/App Bar" stories,
// rendered with the React `AppBar` of @tecton-mui/ui instead of the `<wc-app-bar>` web component.
// The host page (event log, toasts, state updates) follows the story code; only the element changes:
// attributes become props, the `actions` slot becomes the children, and the
// `wc-app-bar-tab-*` events become `onTabSelect` / `onTabClose` / `onTabAdd`.
// See tests/e2e/storybook-parity.spec.ts.
import * as React from 'react';
import {
  AppBar,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  IconButton,
  Snackbar,
  Stack,
  Switch,
  Typography,
  type AppBarFixedTab,
  type AppBarTab,
} from '@tecton-mui/ui';

const LOGO_SRC =
  "data:image/svg+xml,%3csvg%20width='20'%20height='20'%20viewBox='0%200%2020%2020'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20x='3'%20y='3'%20width='14'%20height='14'%20rx='2'%20fill='%23C2867A'/%3e%3c/svg%3e";
const ACTION_SELECTOR = 'button, a[href], [role="button"]';
const toastMessage = (name: string) => `Action "${name}" was clicked.`;
const HOME: AppBarFixedTab[] = [{ id: 'home', icon: 'home', label: 'Home' }];
const TWO_TABS: AppBarTab[] = [
  { id: 'tab-1', label: 'Tab 1', icon: 'project' },
  { id: 'tab-2', label: 'Tab 2', icon: 'project' },
];
const NO_FIXED_TABS: AppBarFixedTab[] = [];

interface HostProps {
  fixedTabs?: AppBarFixedTab[];
  tabs: AppBarTab[];
  activeTab?: string;
  actions?: React.ReactNode;
  caption?: string;
  appName?: string;
  logo?: string;
  logoSrc?: string;
  tier?: 'primary' | 'secondary';
  maxTabs?: number;
  disableTabAdd?: boolean;
}

/** The story host page: owns the tabs, logs the last event and toasts action clicks. */
function Host({
  fixedTabs = NO_FIXED_TABS,
  tabs,
  activeTab,
  actions,
  caption,
  ...attributes
}: HostProps) {
  const [state, setState] = React.useState({ tabs, active: activeTab });
  const [lastEvent, setLastEvent] = React.useState('');
  const [toast, setToast] = React.useState<{ id: number; message: string } | null>(null);
  const added = React.useRef(0);

  const onTabSelect = (id: string) => {
    setState((s) => ({ ...s, active: id }));
    setLastEvent(`wc-app-bar-tab-select ${JSON.stringify({ id })}`);
  };
  const onTabClose = (id: string) => {
    setState((s) => {
      const index = s.tabs.findIndex((t) => t.id === id);
      const next = s.tabs.filter((t) => t.id !== id);
      return {
        tabs: next,
        active: s.active === id ? (next[Math.max(0, index - 1)]?.id ?? fixedTabs[0]?.id) : s.active,
      };
    });
    setLastEvent(`wc-app-bar-tab-remove ${JSON.stringify({ id })}`);
  };
  const onTabAdd = () => {
    added.current += 1;
    const id = `new-${added.current}`;
    setState((s) => ({
      tabs: [...s.tabs, { id, label: `New tab ${added.current}`, icon: 'project' }],
      active: id,
    }));
    setLastEvent('wc-app-bar-tab-add {}');
  };

  return (
    <>
      <Stack spacing={1}>
        {caption && (
          <Typography variant="caption" color="text.secondary">
            {caption}
          </Typography>
        )}
        <AppBar
          appName={attributes.appName}
          logo={attributes.logo}
          logoSrc={attributes.logoSrc}
          tier={attributes.tier}
          maxTabs={attributes.maxTabs}
          disableTabAdd={attributes.disableTabAdd}
          activeTab={state.active}
          fixedTabs={fixedTabs}
          tabs={state.tabs}
          onTabSelect={onTabSelect}
          onTabClose={onTabClose}
          onTabAdd={onTabAdd}
        >
          {actions && (
            <div
              slot="actions"
              onClick={(event) => {
                const target = (event.target as Element).closest(ACTION_SELECTOR);
                if (!target || !event.currentTarget.contains(target)) return;
                const name = target.getAttribute('aria-label') ?? target.textContent?.trim();
                if (name) setToast((t) => ({ id: (t?.id ?? 0) + 1, message: toastMessage(name) }));
              }}
            >
              {actions}
            </div>
          )}
        </AppBar>
        <Typography variant="caption" color="text.secondary" data-testid="event-log">
          {lastEvent ? `Last event: ${lastEvent}` : 'Interact with the bar to see its events.'}
        </Typography>
      </Stack>
      <Snackbar
        key={toast?.id}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={toast !== null}
        autoHideDuration={2500}
        onClose={() => setToast(null)}
        message={toast?.message}
      />
    </>
  );
}

function FourActions() {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', height: '100%' }}>
      <IconButton aria-label="layers">
        <span className="tecton-layers-outline" aria-hidden />
      </IconButton>
      <IconButton aria-label="notifications">
        <span className="tecton-notifications-outline" aria-hidden />
      </IconButton>
      <IconButton aria-label="apps">
        <span className="tecton-apps-outline" aria-hidden />
      </IconButton>
      <IconButton aria-label="account">
        <span className="tecton-person-outline" aria-hidden />
      </IconButton>
    </Stack>
  );
}

const SLOT_COLOR = '#C9A6F6';
const LABEL_INSET = 2;
const PARTS = [
  { key: 'branding', label: 'branding', selector: '[data-region="branding"]', slot: false },
  { key: 'tabs', label: 'tabs', selector: '[data-region="tabs"]', slot: false },
  { key: 'add', label: '+', selector: '[aria-label="Add tab"]', slot: false },
  { key: 'actions', label: 'slot="actions"', selector: '[slot="actions"]', slot: true },
];

function SlotsDiagram() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [labels, setLabels] = React.useState<
    { key: string; label: string; slot: boolean; left: number; width: number }[]
  >([]);
  React.useEffect(() => {
    const host = ref.current;
    const bar = host?.querySelector<HTMLElement>('[data-region="app-bar"]');
    if (!host || !bar) return undefined;
    const measure = () => {
      const left = host.getBoundingClientRect().left;
      setLabels(
        PARTS.flatMap(({ key, label, selector, slot }) => {
          const part = bar.querySelector(selector);
          if (!part) return [];
          const rect = part.getBoundingClientRect();
          return [
            { key, label, slot, left: rect.left - left + LABEL_INSET, width: rect.width - 4 },
          ];
        }),
      );
    };
    const observer = new ResizeObserver(() => {
      measure();
      bar.querySelectorAll('[data-region]').forEach((el) => observer.observe(el));
    });
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  return (
    <Box ref={ref}>
      <AppBar appName="APP" activeTab="tab-1" fixedTabs={HOME} tabs={TWO_TABS}>
        <div slot="actions" style={{ height: '100%' }}>
          <Box
            sx={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              px: 2,
              border: `1px dashed ${SLOT_COLOR}`,
              borderRadius: 'var(--tecton-radius-50)',
            }}
          >
            <Typography variant="caption" sx={{ color: SLOT_COLOR }}>
              Your markup
            </Typography>
          </Box>
        </div>
      </AppBar>
      <Box sx={{ position: 'relative', height: 32, mt: 1 }}>
        {labels.map((part) => (
          <Box
            key={part.key}
            data-part={part.key}
            sx={{
              position: 'absolute',
              top: 0,
              left: part.left,
              width: part.width,
              pt: 0.5,
              textAlign: 'center',
              borderTop: `2px solid ${part.slot ? SLOT_COLOR : 'var(--tecton-color-divider-strong)'}`,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={part.slot ? { color: SLOT_COLOR } : undefined}
            >
              {part.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const TOOLS = [
  { label: 'search', icon: 'tecton-search-outline' },
  { label: 'add', icon: 'tecton-add-outline' },
  { label: 'panel', icon: 'tecton-panel-outline' },
];
const SWITCHES = {
  showTools: TOOLS.map((t) => t.label),
  canPublish: ['Review and Publish'],
  canShare: ['Share'],
};
type SwitchName = keyof typeof SWITCHES;

function ChangingSlot() {
  const [on, setOn] = React.useState<Record<SwitchName, boolean>>({
    showTools: true,
    canPublish: true,
    canShare: true,
  });
  return (
    <Stack spacing={2}>
      <FormGroup row>
        {(Object.keys(SWITCHES) as SwitchName[]).map((name) => (
          <FormControlLabel
            key={name}
            label={name}
            control={
              <Switch
                checked={on[name]}
                onChange={() => setOn((s) => ({ ...s, [name]: !s[name] }))}
              />
            }
          />
        ))}
      </FormGroup>
      <Host
        appName="APP"
        fixedTabs={HOME}
        tabs={TWO_TABS}
        activeTab="tab-1"
        actions={
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', height: '100%' }}>
            {on.showTools && (
              <Stack direction="row" spacing={1}>
                {TOOLS.map(({ label, icon }) => (
                  <IconButton key={label} size="small" color="tertiary" aria-label={label}>
                    <span className={icon} aria-hidden />
                  </IconButton>
                ))}
              </Stack>
            )}
            {(on.canPublish || on.canShare) && (
              <Stack direction="row" spacing={1}>
                {on.canPublish && (
                  <Button
                    size="small"
                    variant="text"
                    color="tertiary"
                    startIcon={<span className="tecton-export-upload-outline" aria-hidden />}
                  >
                    Review and Publish
                  </Button>
                )}
                {on.canShare && (
                  <Button size="small" variant="contained" color="secondary">
                    Share
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        }
      />
    </Stack>
  );
}

const LIVE_ATTRIBUTES = [
  { name: 'app-name', label: 'app-name="Renamed app"' },
  { name: 'logo', label: 'logo="apps-filled"' },
  { name: 'logo-src', label: 'logo-src' },
  { name: 'tier', label: 'tier="secondary"' },
  { name: 'max-tabs', label: 'max-tabs="2"' },
  { name: 'disable-tab-add', label: 'disable-tab-add' },
];

function LiveAttributes() {
  const [set, setSet] = React.useState(() => new Set<string>());
  const toggle = (name: string) =>
    setSet((s) => {
      const next = new Set(s);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  return (
    <Stack spacing={2}>
      <FormGroup row>
        {LIVE_ATTRIBUTES.map(({ name, label }) => (
          <FormControlLabel
            key={name}
            label={label}
            control={<Switch checked={set.has(name)} onChange={() => toggle(name)} />}
          />
        ))}
      </FormGroup>
      <Host
        appName={set.has('app-name') ? 'Renamed app' : undefined}
        logo={set.has('logo') ? 'apps-filled' : undefined}
        logoSrc={set.has('logo-src') ? LOGO_SRC : undefined}
        tier={set.has('tier') ? 'secondary' : undefined}
        maxTabs={set.has('max-tabs') ? 2 : undefined}
        disableTabAdd={set.has('disable-tab-add')}
        fixedTabs={HOME}
        tabs={TWO_TABS}
        activeTab="tab-1"
        actions={<FourActions />}
      />
    </Stack>
  );
}

const MANY_TABS: AppBarTab[] = Array.from({ length: 14 }, (_, i) => ({
  id: `tab-${i + 1}`,
  label: `Tab ${i + 1}`,
  icon: 'project',
}));
const LONG_LABEL = 'A tab label much longer than the tab can show on one line';
const LONG_APP_NAME = 'An application name longer than the branding region';

type Args = Record<string, unknown>;

export const meta = { title: 'Drop-ins/App Bar' };
export const stories: Record<string, { args?: Args; render: (args: Args) => React.ReactNode }> = {
  'drop-ins-app-bar--primary': {
    args: { appName: 'APP', fixedTabs: HOME, tabs: TWO_TABS, activeTab: 'tab-1' },
    render: (args) => <Host {...(args as unknown as HostProps)} actions={<FourActions />} />,
  },
  'drop-ins-app-bar--figma-variant': {
    args: { appName: 'APP', fixedTabs: HOME, tabs: TWO_TABS, activeTab: 'tab-1' },
    render: (args) => <Host {...(args as unknown as HostProps)} actions={<FourActions />} />,
  },
  'drop-ins-app-bar--secondary': {
    args: {
      tier: 'secondary',
      tabs: [
        { id: 'details', label: 'Details' },
        { id: 'history', label: 'History' },
        { id: 'permissions', label: 'Permissions', closeable: false },
      ],
      activeTab: 'details',
    },
    render: (args) => <Host {...(args as unknown as HostProps)} />,
  },
  'drop-ins-app-bar--branding': {
    render: () => (
      <Stack spacing={3}>
        <Host caption="No logo" appName="APP" fixedTabs={HOME} tabs={[]} activeTab="home" />
        <Host
          caption='logo="apps-filled"'
          appName="Apps"
          logo="apps-filled"
          fixedTabs={HOME}
          tabs={[]}
          activeTab="home"
        />
        <Host
          caption="logo-src"
          appName="Product"
          logoSrc={LOGO_SRC}
          fixedTabs={HOME}
          tabs={[]}
          activeTab="home"
        />
      </Stack>
    ),
  },
  'drop-ins-app-bar--tab-options': {
    args: {
      appName: 'APP',
      fixedTabs: HOME,
      tabs: [
        { id: 'overview', label: 'Overview', icon: 'project', tags: ['beta'] },
        { id: 'pinned', label: 'Pinned', icon: 'project', closeable: false },
        { id: 'archived', label: 'Archived', icon: 'project', disabled: true },
      ],
      activeTab: 'overview',
    },
    render: (args) => <Host {...(args as unknown as HostProps)} />,
  },
  'drop-ins-app-bar--tab-limits': {
    render: () => (
      <Stack spacing={3}>
        <Host
          caption='max-tabs="3": add two more tabs'
          appName="APP"
          maxTabs={3}
          fixedTabs={HOME}
          tabs={[TWO_TABS[0]]}
          activeTab="tab-1"
        />
        <Host
          caption="disable-tab-add"
          appName="APP"
          disableTabAdd
          fixedTabs={HOME}
          tabs={TWO_TABS}
          activeTab="tab-1"
        />
      </Stack>
    ),
  },
  'drop-ins-app-bar--slots': { render: () => <SlotsDiagram /> },
  'drop-ins-app-bar--slots-with-changing-content': { render: () => <ChangingSlot /> },
  'drop-ins-app-bar--overflow': {
    render: () => (
      <Stack spacing={3}>
        <Host
          caption="14 tabs"
          appName="APP"
          fixedTabs={HOME}
          tabs={MANY_TABS}
          activeTab="tab-1"
          actions={<FourActions />}
        />
        <Host
          caption="Long label with tags"
          appName="APP"
          fixedTabs={HOME}
          tabs={[
            { id: 'long', label: LONG_LABEL, icon: 'project', tags: ['beta', 'draft'] },
            { id: 'short', label: 'Short', icon: 'project' },
          ]}
          activeTab="long"
          actions={<FourActions />}
        />
        <Box sx={{ maxWidth: 800 }}>
          <Host
            caption="Long app name, 800px container"
            appName={LONG_APP_NAME}
            fixedTabs={HOME}
            tabs={MANY_TABS.slice(0, 6)}
            activeTab="tab-1"
            actions={<FourActions />}
          />
        </Box>
      </Stack>
    ),
  },
  'drop-ins-app-bar--live-attributes': { render: () => <LiveAttributes /> },
  'drop-ins-app-bar--playground': {
    args: {
      appName: 'APP',
      tier: 'primary',
      logo: 'none',
      tabCount: 2,
      maxTabs: 0,
      disableTabAdd: false,
      showActions: true,
    },
    render: (args) => {
      const tabs = MANY_TABS.slice(0, args.tabCount as number);
      return (
        <Host
          key={JSON.stringify(args)}
          appName={args.appName as string}
          tier={args.tier as 'primary' | 'secondary'}
          logo={args.logo === 'none' ? undefined : (args.logo as string)}
          maxTabs={(args.maxTabs as number) > 0 ? (args.maxTabs as number) : undefined}
          disableTabAdd={args.disableTabAdd as boolean}
          fixedTabs={HOME}
          tabs={tabs}
          activeTab={tabs[0]?.id ?? (args.tier === 'primary' ? 'home' : undefined)}
          actions={args.showActions ? <FourActions /> : undefined}
        />
      );
    },
  },
};
