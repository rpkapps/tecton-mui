// Rewrites the `@mui/icons-material` icons of a synced demo to the Tecton `Icon` component
// (`@tecton-mui/ui/Icon`), so the code readers see and copy is the code a product UI writes:
//
//   import DeleteIcon from '@mui/icons-material/Delete';   import Icon from '@tecton-mui/ui/Icon';
//   <DeleteIcon fontSize="small" color="error" />      ->  <Icon name="delete" size="small" sx={{ color: 'error.main' }} />
//
// The Tecton name comes from tooling/docs-sync/icon-map.json. SvgIcon props are translated
// (`fontSize` -> `size`, `color` / `htmlColor` -> `sx.color`, `titleAccess` -> `title`); every other
// prop is kept. An icon passed as a component (`slots={{ previous: ArrowBackIcon }}`,
// `component={DoneIcon}`, `const SelectionIcon = checked ? CheckBoxIcon : ...`) becomes a small
// local wrapper with the same name. See repo-docs/documentation-sync.md ("Demo adaptation").

const ICON_MODULE = '@tecton-mui/ui/Icon';

/** SvgIcon `color` values -> theme palette paths for `sx.color` (`Icon` has no `color` prop). */
const PALETTE = {
  action: 'action.active',
  disabled: 'action.disabled',
  primary: 'primary.main',
  secondary: 'secondary.main',
  error: 'error.main',
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
};

/**
 * Where the Tecton theme sizes the icons placed in a component (`children` or the icon prop). An
 * icon there needs no `size`. Anywhere else an icon without `fontSize` gets `size="medium"`, the
 * SvgIcon default (Tecton 20px), because `Icon` defaults to `inherit` (1em of the text).
 */
const SIZED_BY_CONTAINER = {
  Alert: ['icon'],
  AccordionSummary: ['expandIcon'],
  Avatar: ['children'],
  Button: ['startIcon', 'endIcon'],
  Checkbox: ['icon', 'checkedIcon', 'indeterminateIcon'],
  Chip: ['deleteIcon'],
  Fab: ['children'],
  IconButton: ['children'],
  Radio: ['icon', 'checkedIcon'],
  Rating: ['icon', 'emptyIcon'],
  SpeedDialAction: ['icon'],
  ToggleButton: ['children'],
};

/**
 * Tecton icon for an `@mui/icons-material` name: `icon-map.json` maps base names (without the
 * Outlined/Rounded/Sharp/TwoTone suffix). Icons use Tecton's default outline style; names listed in
 * `filled` use the filled style. Returns `null` when the map has no entry.
 */
export function tectonIcon(muiName, iconMap) {
  const base = muiName.replace(/(Outlined|Rounded|Sharp|TwoTone)$/, '');
  const name = iconMap.icons[base] ?? iconMap.icons[base.replace(/Ios$/, '')];
  if (!name) return null;
  const filled = !/Outlined$/.test(muiName) && iconMap.filled.includes(base);
  return { name, variant: filled ? 'filled' : 'outline' };
}

const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

/**
 * @param {object} options
 * @param {Array<{ stmt: import('typescript').ImportDeclaration, local: string, name: string }>} options.imports
 *   the icon imports of the file (local binding -> `@mui/icons-material` name)
 * @param {Array<{ start: number, end: number, text: string }>} options.edits text edits on the
 *   original source, applied by the caller
 * @returns {{ icons: string[], wrappers: string[] } | { missing: string[] } | { exclude: string }}
 */
export function rewriteIcons({ ts, sf, fileName, imports, iconMap, edits }) {
  const missing = [...new Set(imports.map((i) => i.name))].filter((n) => !tectonIcon(n, iconMap));
  if (missing.length) return { missing };
  const iconOf = new Map(imports.map((i) => [i.local, tectonIcon(i.name, iconMap)]));
  const importStmts = new Set(imports.map((i) => i.stmt));

  // Component names behind JSX tags: imports from @mui/material and @mui/lab, and styled() wrappers
  // of them (`const StyledRating = styled(Rating)(...)`).
  const componentOf = new Map();
  const styledBase = new Map();
  const aliases = new Set();
  let nameTaken = false;
  const isIconExpr = (e) =>
    ts.isParenthesizedExpression(e)
      ? isIconExpr(e.expression)
      : ts.isConditionalExpression(e)
        ? isIconExpr(e.whenTrue) && isIconExpr(e.whenFalse)
        : ts.isIdentifier(e) && iconOf.has(e.text);
  const scan = (node) => {
    if (ts.isIdentifier(node) && /^Icon(Props)?$/.test(node.text)) nameTaken = true;
    if (ts.isImportDeclaration(node)) {
      if (importStmts.has(node)) return;
      const m = /^@mui\/(?:material|lab)(?:\/(\w+))?$/.exec(node.moduleSpecifier.text);
      const clause = node.importClause;
      if (m && clause?.name && m[1]) componentOf.set(clause.name.text, m[1]);
      if (m && clause?.namedBindings && ts.isNamedImports(clause.namedBindings))
        for (const el of clause.namedBindings.elements)
          componentOf.set(el.name.text, (el.propertyName ?? el.name).text);
      ts.forEachChild(node, scan);
      return;
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = node.initializer;
      // `const SelectionIcon = checked ? CheckBoxIcon : CheckBoxOutlineBlankIcon;`
      if (isIconExpr(init)) aliases.add(node.name.text);
      // `styled(X)(...)` or `styled(X, options)(...)`
      if (
        ts.isCallExpression(init) &&
        ts.isCallExpression(init.expression) &&
        ts.isIdentifier(init.expression.expression) &&
        init.expression.expression.text === 'styled' &&
        init.expression.arguments[0] &&
        ts.isIdentifier(init.expression.arguments[0])
      )
        styledBase.set(node.name.text, init.expression.arguments[0].text);
    }
    ts.forEachChild(node, scan);
  };
  scan(sf);
  if (nameTaken)
    return { exclude: 'already uses the name `Icon`, which the Tecton icon import needs' };
  const componentName = (tag) => {
    let name = tag.getText(sf);
    for (let i = 0; i < 5 && styledBase.has(name); i += 1) name = styledBase.get(name);
    return componentOf.get(name) ?? name;
  };

  /** The component and prop an icon element is placed in, if it is placed in JSX. */
  const hostOf = (element) => {
    let node = element;
    for (let p = node.parent; p; node = p, p = p.parent) {
      if (
        ts.isParenthesizedExpression(p) ||
        ts.isConditionalExpression(p) ||
        ts.isBinaryExpression(p) ||
        ts.isJsxFragment(p)
      )
        continue;
      if (ts.isJsxExpression(p)) {
        if (ts.isJsxAttribute(p.parent))
          return {
            component: componentName(p.parent.parent.parent.tagName),
            prop: p.parent.name.getText(sf),
          };
        continue;
      }
      if (ts.isJsxElement(p) && p.openingElement !== node)
        return { component: componentName(p.openingElement.tagName), prop: 'children' };
      return null;
    }
    return null;
  };

  const objectHas = (expr, key) =>
    !!expr &&
    ts.isObjectLiteralExpression(expr) &&
    expr.properties.some((p) => p.name && p.name.getText(sf) === key);
  const attrExpr = (a) =>
    a?.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : undefined;

  /**
   * Translates the SvgIcon props of an icon element (or of an element whose tag is an icon alias).
   * Returns the attributes to add after the tag name, or an exclusion reason.
   */
  const translateProps = (opening, element) => {
    const attrs = opening.attributes.properties.filter(ts.isJsxAttribute);
    const byName = new Map(attrs.map((a) => [a.name.getText(sf), a]));
    const remove = (a) => edits.push({ start: a.getFullStart(), end: a.getEnd(), text: '' });
    const rename = (a, to) =>
      edits.push({ start: a.name.getStart(sf), end: a.name.getEnd(), text: to });
    const literal = (a) => {
      const init = a.initializer;
      if (init && ts.isStringLiteral(init)) return init.text;
      const expr = attrExpr(a);
      return expr && ts.isStringLiteral(expr) ? expr.text : null;
    };
    const sxEntries = [];
    const extra = [];
    const fontSize = byName.get('fontSize');
    if (fontSize) {
      const value = literal(fontSize);
      if (value === 'inherit') remove(fontSize);
      else if (value === null || ['small', 'medium', 'large'].includes(value))
        rename(fontSize, 'size');
      else {
        remove(fontSize);
        sxEntries.push(`fontSize: ${quote(value)}`);
      }
    }
    const color = byName.get('color');
    if (color) {
      const value = literal(color);
      if (value === null) return { exclude: 'passes a computed `color` to an icon' };
      remove(color);
      if (value !== 'inherit') sxEntries.push(`color: ${quote(PALETTE[value] ?? value)}`);
    }
    const htmlColor = byName.get('htmlColor');
    if (htmlColor) {
      const value = literal(htmlColor);
      remove(htmlColor);
      sxEntries.push(`color: ${value === null ? attrExpr(htmlColor).getText(sf) : quote(value)}`);
    }
    const titleAccess = byName.get('titleAccess');
    if (titleAccess) rename(titleAccess, 'title');
    for (const prop of ['component', 'viewBox', 'inheritViewBox', 'shapeRendering'])
      if (byName.has(prop)) return { exclude: `passes the SvgIcon-only prop \`${prop}\`` };

    const sx = byName.get('sx');
    const sxExpr = attrExpr(sx);
    if (
      !fontSize &&
      !objectHas(sxExpr, 'fontSize') &&
      !objectHas(attrExpr(byName.get('style')), 'fontSize')
    ) {
      const host = hostOf(element);
      if (!host || !SIZED_BY_CONTAINER[host.component]?.includes(host.prop))
        extra.push('size="medium"');
    }
    if (sxEntries.length) {
      const entries = sxEntries.join(', ');
      if (!sx) extra.push(`sx={{ ${entries} }}`);
      else if (sxExpr && ts.isObjectLiteralExpression(sxExpr) && sxExpr.properties.length)
        edits.push({
          start: sxExpr.properties[0].getStart(sf),
          end: sxExpr.properties[0].getStart(sf),
          text: `${entries}, `,
        });
      else if (sxExpr && ts.isObjectLiteralExpression(sxExpr))
        edits.push({ start: sxExpr.getStart(sf), end: sxExpr.getEnd(), text: `{ ${entries} }` });
      else if (sxExpr && ts.isArrayLiteralExpression(sxExpr) && sxExpr.elements.length)
        edits.push({
          start: sxExpr.elements[0].getStart(sf),
          end: sxExpr.elements[0].getStart(sf),
          text: `{ ${entries} }, `,
        });
      else return { exclude: 'combines an icon `color` with a computed `sx`' };
    }
    return { extra };
  };

  const isTagName = (node) =>
    (ts.isJsxOpeningElement(node.parent) ||
      ts.isJsxSelfClosingElement(node.parent) ||
      ts.isJsxClosingElement(node.parent)) &&
    node.parent.tagName === node;
  const wrappers = new Set();
  let exclude = null;
  const visit = (node) => {
    if (exclude || ts.isImportDeclaration(node)) return;
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName;
      const element = ts.isJsxOpeningElement(node) ? node.parent : node;
      if (ts.isIdentifier(tag) && (iconOf.has(tag.text) || aliases.has(tag.text))) {
        const result = translateProps(node, element);
        if (result.exclude) {
          exclude = result.exclude;
          return;
        }
        const icon = iconOf.get(tag.text);
        const added = [
          icon && `name="${icon.name}"`,
          icon?.variant === 'filled' && 'variant="filled"',
          ...result.extra,
        ].filter(Boolean);
        // Added props follow the element's layout: on the tag's line, or one per line.
        const firstAttr = node.attributes.properties[0];
        const lineOf = (pos) => sf.getLineAndCharacterOfPosition(pos).line;
        const separator =
          firstAttr && lineOf(firstAttr.getStart(sf)) !== lineOf(tag.getStart(sf))
            ? `\n${' '.repeat(sf.getLineAndCharacterOfPosition(firstAttr.getStart(sf)).character)}`
            : ' ';
        edits.push({
          start: tag.getStart(sf),
          end: tag.getEnd(),
          text: [icon ? 'Icon' : tag.text, ...added].join(separator),
        });
      }
    } else if (ts.isJsxClosingElement(node)) {
      if (ts.isIdentifier(node.tagName) && iconOf.has(node.tagName.text))
        edits.push({ start: node.tagName.getStart(sf), end: node.tagName.getEnd(), text: 'Icon' });
      return;
    } else if (ts.isIdentifier(node) && iconOf.has(node.text) && !isTagName(node)) {
      wrappers.add(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (exclude) return { exclude };
  if (wrappers.size && !/\.tsx$/.test(fileName))
    return { exclude: 'passes icons as components outside a .tsx module' };

  // One `Icon` import in place of the first icon import; the others are removed.
  const [first, ...rest] = [...importStmts].sort((a, b) => a.getStart(sf) - b.getStart(sf));
  edits.push({
    start: first.getStart(sf),
    end: first.getEnd(),
    text: `import Icon${wrappers.size ? ', { type IconProps }' : ''} from '${ICON_MODULE}';`,
  });
  for (const stmt of rest) edits.push({ start: stmt.getFullStart(), end: stmt.getEnd(), text: '' });
  // Icons passed as components: a local wrapper with the same name, after the imports.
  if (wrappers.size) {
    const lastImport = sf.statements.filter(ts.isImportDeclaration).at(-1);
    const code = [...wrappers].map((local) => {
      const { name, variant } = iconOf.get(local);
      const variantAttr = variant === 'filled' ? ' variant="filled"' : '';
      return `function ${local}(props: Omit<IconProps, 'name'>) {\n  return <Icon name="${name}"${variantAttr} {...props} />;\n}`;
    });
    edits.push({
      start: lastImport.getEnd(),
      end: lastImport.getEnd(),
      text: `\n\n${code.join('\n\n')}`,
    });
  }
  return {
    icons: [...new Set(imports.map((i) => i.name))],
    wrappers: [...wrappers].map((local) => imports.find((i) => i.local === local).name),
  };
}
