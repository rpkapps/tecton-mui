// Reproduction of the Tecton Storybook 0.10.1 stories for this component, generated from the
// published story bundle and rendered with @tecton-mui/ui (see tests/e2e/storybook-parity).
// Story ids match the Storybook index; layout wrappers are reproduced by StorybookScenario.
import * as React from 'react';

// The Storybook's sample avatar photo (loaded from the Storybook CDN, not vendored).
const image_a =
  'https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/storybook-mui/0.10.1/assets/image-DhKpiPGa.png';
import { Avatar, AvatarGroup, Box, Stack, Typography } from '@tecton-mui/ui';

const Ca = [40, 32, 24, 18];
const oa = { 40: 'large', 32: 'medium', 24: 'small', 18: 'xsmall' };
const b = [
  'var(--tecton-color-accent-pink-fill)',
  'var(--tecton-color-slider-tertiary-track)',
  'var(--tecton-color-accent-lemon-fill)',
  'var(--tecton-color-accent-blue-fill)',
  'var(--tecton-color-accent-saffron-fill)',
];
function CKa({ content: e, size: r, shape: t, disabled: n }) {
  const i = { variant: t, size: oa[r], disabled: n || undefined };
  return e === 'text' ? (
    <Avatar {...i}>OP</Avatar>
  ) : e === 'icon' ? (
    <Avatar {...i}>
      <span className="tecton-person-filled" aria-hidden />
    </Avatar>
  ) : (
    <Avatar {...i} src={image_a} alt="OP" />
  );
}
function E({ content: e }) {
  const r = [
    { shape: 'circular', disabled: false, label: 'Circular' },
    { shape: 'rounded', disabled: false, label: 'Rounded' },
    { shape: 'square', disabled: false, label: 'Square' },
    { shape: 'circular', disabled: true, label: 'Circular · Disabled' },
    { shape: 'rounded', disabled: true, label: 'Rounded · Disabled' },
    { shape: 'square', disabled: true, label: 'Square · Disabled' },
  ];
  return (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', gap: 3, pl: '68px' }}>
        {r.map((t) => (
          <Box key={t.label} sx={{ width: 48, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t.label}
            </Typography>
          </Box>
        ))}
      </Box>
      {Ca.map((t) => (
        <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              minWidth: 52,
              textAlign: 'right',
              pr: 1.5,
              flexShrink: 0,
            }}
          >
            {t}px
          </Typography>
          {r.map((n) => (
            <Box key={n.label} sx={{ width: 48, display: 'flex', justifyContent: 'center' }}>
              <CKa content={e} size={t} shape={n.shape} disabled={n.disabled} />
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
}
function Ia() {
  const e = [
      { key: 'medium', label: 'Medium' },
      { key: 'small', label: 'Small' },
      { key: 'number', value: 6, label: 'Number (6)' },
    ],
    r = [40, 32, 24];
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', gap: 4, pl: '68px' }}>
        {e.map((t) => (
          <Box key={t.label} sx={{ width: 160 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t.label}
            </Typography>
          </Box>
        ))}
      </Box>
      {r.map((t) => (
        <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              minWidth: 52,
              textAlign: 'right',
              pr: 1.5,
              flexShrink: 0,
            }}
          >
            {t}px
          </Typography>
          {e.map((n) => (
            <Box key={n.label} sx={{ width: 160 }}>
              <AvatarGroup max={3} spacing={n.key === 'number' ? n.value : n.key} size={oa[t]}>
                {Array.from({ length: 4 }).map((i, l) => (
                  <Avatar key={l}>
                    <span className="tecton-person-filled" aria-hidden />
                  </Avatar>
                ))}
              </AvatarGroup>
            </Box>
          ))}
        </Box>
      ))}
    </Stack>
  );
}
function Oa() {
  const e = [2, 3, 4, 5];
  return (
    <Stack spacing={2}>
      {e.map((r) => (
        <Box key={r} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              minWidth: 52,
              textAlign: 'right',
              pr: 1.5,
              flexShrink: 0,
            }}
          >
            {'Max: '}
            {r}
          </Typography>
          <AvatarGroup max={r} spacing="medium" size="large">
            {Array.from({ length: 10 }).map((t, n) => (
              <Avatar key={n}>
                <span className="tecton-person-filled" aria-hidden />
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      ))}
    </Stack>
  );
}
function CX({ children: e }) {
  return <Box sx={{ display: 'inline-flex' }}>{e}</Box>;
}
function ImageAvatarCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Content = Image
      </Typography>
      <E content="image" />
    </Stack>
  );
}
function InitialsAvatarCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Content = Text
      </Typography>
      <E content="text" />
    </Stack>
  );
}
function IconAvatarCanvas() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        Content = Icon
      </Typography>
      <E content="icon" />
    </Stack>
  );
}
function SizesCanvas() {
  return (
    <Stack spacing={4}>
      <Typography variant="h6">Grouped avatars · Size, Spacing, Max</Typography>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Size and Spacing (Max = 3)
        </Typography>
        <Ia />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Max: overflow chip (Size = 40px, Spacing = Medium)
        </Typography>
        <Oa />
      </Stack>
    </Stack>
  );
}
function ExamplesCanvas() {
  const e = [
      <Avatar key={'ma'}>MA</Avatar>,
      <Avatar key={'so'}>SO</Avatar>,
      <Avatar key={'sg'}>SG</Avatar>,
      <Avatar key={'pt'}>PT</Avatar>,
      <Avatar key={'ak'}>AK</Avatar>,
      <Avatar key={'bl'}>BL</Avatar>,
    ],
    r = [
      <Avatar key={'i1'}>
        <span className="tecton-person-filled" aria-hidden />
      </Avatar>,
      <Avatar key={'i2'}>
        <span className="tecton-person-filled" aria-hidden />
      </Avatar>,
      <Avatar key={'i3'}>
        <span className="tecton-person-filled" aria-hidden />
      </Avatar>,
      <Avatar key={'i4'}>
        <span className="tecton-person-filled" aria-hidden />
      </Avatar>,
      <Avatar key={'i5'}>
        <span className="tecton-person-filled" aria-hidden />
      </Avatar>,
    ],
    t = [
      <Avatar key={'im1'} src={image_a} alt="Jane" />,
      <Avatar key={'im2'} src={image_a} alt="John" />,
      <Avatar key={'im3'} src={image_a} alt="Kim" />,
      <Avatar key={'im4'} src={image_a} alt="Lee" />,
      <Avatar key={'im5'} src={image_a} alt="Max" />,
      <Avatar key={'im6'} src={image_a} alt="Nia" />,
    ];
  return (
    <Stack spacing={3} alignItems="flex-start">
      <CX>
        <Avatar size="large">OP</Avatar>
      </CX>
      <CX>
        <AvatarGroup max={4} spacing="medium" size="medium">
          {e}
        </AvatarGroup>
      </CX>
      <CX>
        <AvatarGroup max={4} spacing="small" size="small">
          {e}
        </AvatarGroup>
      </CX>
      <CX>
        <AvatarGroup max={4} spacing="medium" size="small">
          {e}
        </AvatarGroup>
      </CX>
      <CX>
        <AvatarGroup max={4} spacing={6} size="small">
          {e}
        </AvatarGroup>
      </CX>
      <CX>
        <AvatarGroup max={3} spacing={32} size="large">
          {r}
        </AvatarGroup>
      </CX>
      <CX>
        <AvatarGroup max={4} spacing={6} size="small">
          {t}
        </AvatarGroup>
      </CX>
    </Stack>
  );
}
const te = { title: 'Atoms/Avatar', component: Avatar };
const Story_Sizes = { name: 'Sizes', render: () => <SizesCanvas /> };
const Story_ImageAvatar = { name: 'Image', render: () => <ImageAvatarCanvas /> };
const Story_InitialsAvatar = { name: 'Initials', render: () => <InitialsAvatarCanvas /> };
const Story_IconAvatar = { name: 'Icon', render: () => <IconAvatarCanvas /> };
const Story_Examples = { name: 'Examples', render: () => <ExamplesCanvas /> };
const U = { default: undefined, pink: b[0], lime: b[1], lemon: b[2], blue: b[3], saffron: b[4] };
const Story_Playground = {
  name: 'Playground',
  args: {
    content: 'text',
    variant: 'circular',
    size: 'medium',
    bgcolor: 'default',
    disabled: false,
    src: '',
    children: 'OP',
  },
  render: function StoryRender(e) {
    const r = e.content === 'image' ? e.src || image_a : undefined,
      t = e.content === 'image' ? e.children || 'avatar' : undefined,
      n =
        e.content === 'icon' ? (
          <span className="tecton-person-filled" aria-hidden />
        ) : e.content === 'text' ? (
          e.children
        ) : undefined;
    return (
      <Stack sx={{ p: 3, alignItems: 'flex-start' }}>
        <Avatar
          variant={e.variant}
          size={e.size}
          bgcolor={U[e.bgcolor]}
          disabled={e.disabled || undefined}
          src={r}
          alt={t}
        >
          {n}
        </Avatar>
      </Stack>
    );
  },
};

export const meta = te;
export const stories = {
  'atoms-avatar--examples': Story_Examples,
  'atoms-avatar--icon-avatar': Story_IconAvatar,
  'atoms-avatar--image-avatar': Story_ImageAvatar,
  'atoms-avatar--initials-avatar': Story_InitialsAvatar,
  'atoms-avatar--playground': Story_Playground,
  'atoms-avatar--sizes': Story_Sizes,
};
