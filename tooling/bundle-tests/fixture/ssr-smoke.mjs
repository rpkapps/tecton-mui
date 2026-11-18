import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const React = require('react');
const { renderToString } = require('react-dom/server');
const { ThemeProvider } = await import('@tecton-mui/ui/styles');
const { default: Button } = await import('@tecton-mui/ui/Button');
const { Button: B2, DataGrid, Icon, LocalizationProvider, DatePicker } = await import('@tecton-mui/ui');
console.log(Button === B2, typeof DataGrid, typeof Icon);
const html = renderToString(React.createElement(ThemeProvider, null, React.createElement(Button, { variant: 'contained' }, 'Save'), React.createElement(Icon, {name:'add'}),
 React.createElement(LocalizationProvider, null, React.createElement(DatePicker, {label: 'Start'}))));
console.log(html.slice(0, 600));
