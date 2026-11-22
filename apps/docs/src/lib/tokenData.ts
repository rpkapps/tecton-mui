// The token stylesheet the library ships as `@tecton-mui/ui/styles/tokens.css` (also part of
// `global.css`). The portal reads it from the package assets, like src/styles/tecton-global.css, so
// it builds without the UI package build. The Foundations pages are generated from it.
import tokensCss from '../../../../packages/ui/assets/tecton/tokens.css?raw';
import { groupColorTokens, parseTokenCss } from './tectonTokens';

export const tokenVariables = parseTokenCss(tokensCss);
export const colorGroups = groupColorTokens(tokenVariables);
