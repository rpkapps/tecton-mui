import AppBar from '@tecton-mui/ui/AppBar';
import Stack from '@tecton-mui/ui/Stack';

const HOME = [{ id: 'home', icon: 'home', label: 'Home' }];
// Any image works: an imported asset, a URL or, as here, an inline SVG.
const LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%237c5cbf'/%3E%3C/svg%3E";

export default function BrandingAppBar() {
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* No logo: a placeholder square */}
      <AppBar appName="APP" fixedTabs={HOME} activeTab="home" />
      {/* A Tecton icon, suffix included */}
      <AppBar appName="Field Planner" logo="map-filled" fixedTabs={HOME} activeTab="home" />
      {/* An image, used when `logo` is not set */}
      <AppBar appName="Asset Viewer" logoSrc={LOGO} fixedTabs={HOME} activeTab="home" />
    </Stack>
  );
}
