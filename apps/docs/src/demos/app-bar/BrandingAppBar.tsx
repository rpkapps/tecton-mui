import AppBar, { AppBarBrand, AppBarTab, AppBarTabs } from '@tecton-mui/ui/AppBar';
import Icon from '@tecton-mui/ui/Icon';
import Stack from '@tecton-mui/ui/Stack';
import SvgIcon from '@tecton-mui/ui/SvgIcon';

// Any image works: an imported asset, a URL or, as here, an inline SVG.
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%237c5cbf'/%3E%3C/svg%3E";

function Home() {
  return (
    <AppBarTabs value="home">
      <AppBarTab value="home" icon={<Icon name="home" />} aria-label="Home" />
    </AppBarTabs>
  );
}

export default function BrandingAppBar() {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* No logo: a placeholder square */}
      <AppBar>
        <AppBarBrand>APP</AppBarBrand>
        <Home />
      </AppBar>
      {/* A Tecton icon */}
      <AppBar>
        <AppBarBrand logo={<Icon name="map" variant="filled" />}>Field Planner</AppBarBrand>
        <Home />
      </AppBar>
      {/* An SvgIcon */}
      <AppBar>
        <AppBarBrand
          logo={
            <SvgIcon>
              <path d="M12 2 2 12l10 10 10-10L12 2Zm0 4.2L17.8 12 12 17.8 6.2 12 12 6.2Z" />
            </SvgIcon>
          }
        >
          Survey Studio
        </AppBarBrand>
        <Home />
      </AppBar>
      {/* An image */}
      <AppBar>
        <AppBarBrand logo={<img src={LOGO} alt="Asset Viewer" />}>Asset Viewer</AppBarBrand>
        <Home />
      </AppBar>
    </Stack>
  );
}
