import * as React from 'react';

/**
 * The children as a flat list, with fragments opened (`<>…</>` counts as its children), each with
 * a stable key. Lets the actions collapse one by one however they are grouped in the source.
 */
export function flattenChildren(children: React.ReactNode, prefix = ''): React.ReactNode[] {
  const flat: React.ReactNode[] = [];
  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) {
      flat.push(child);
    } else if (child.type === React.Fragment) {
      flat.push(...flattenChildren(child.props.children, `${prefix}${String(child.key)}/`));
    } else {
      flat.push(
        prefix ? React.cloneElement(child, { key: `${prefix}${String(child.key)}` }) : child,
      );
    }
  });
  return flat;
}
