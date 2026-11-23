import * as React from 'react';
import Box from '@tecton-mui/ui/Box';
import Heading, { HeadingTitle } from '@tecton-mui/ui/Heading';
import Icon from '@tecton-mui/ui/Icon';
import IconButton from '@tecton-mui/ui/IconButton';
import Menu from '@tecton-mui/ui/Menu';
import MenuItem from '@tecton-mui/ui/MenuItem';

const HOME = 'All portfolios';
const PORTFOLIOS = ['Gulf Coast', 'North Sea', 'Permian Basin'];

export default function TitleButtonsHeading() {
  const [portfolio, setPortfolio] = React.useState('Gulf Coast');
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  return (
    <Box sx={{ width: '100%' }}>
      <Heading>
        <IconButton aria-label={HOME} onClick={() => setPortfolio(HOME)}>
          <Icon name="home" />
        </IconButton>
        <HeadingTitle>{portfolio}</HeadingTitle>
        <IconButton
          size="small"
          aria-label="Switch portfolio"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? 'heading-portfolio-menu' : undefined}
          onClick={(event) => setAnchor(event.currentTarget)}
        >
          <Icon name="chevron-down" />
        </IconButton>
      </Heading>
      <Menu
        id="heading-portfolio-menu"
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        slotProps={{ list: { 'aria-label': 'Portfolios' } }}
      >
        {PORTFOLIOS.map((name) => (
          <MenuItem
            key={name}
            selected={name === portfolio}
            onClick={() => {
              setPortfolio(name);
              setAnchor(null);
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
