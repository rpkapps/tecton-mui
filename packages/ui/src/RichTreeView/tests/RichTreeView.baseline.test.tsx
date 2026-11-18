import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as Community from '@mui/x-tree-view/RichTreeView';
import { useRichTreeViewApiRef } from '@mui/x-tree-view/hooks';
import * as TectonModule from '../index.js';
import { RichTreeView } from '../index.js';
import { ITEMS, getItem, getLabels } from './fixtures.js';

/** Removes the generated ids (`_r_0_`...) so two renders can be compared. */
const normalize = (html: string) => html.replace(/id="[^"]*"/g, 'id=""');

describe('RichTreeView – baseline parity with the Community component', () => {
  it('re-exports every Community named export and adds the Tecton ones', () => {
    for (const name of Object.keys(Community)) {
      expect(TectonModule).toHaveProperty(name);
    }
    expect(TectonModule.default).toBe(TectonModule.RichTreeView);
    expect(TectonModule.RichTreeView).not.toBe(Community.RichTreeView);
    expect(TectonModule.richTreeViewClasses).toBe(Community.richTreeViewClasses);
    expect(TectonModule.TreeViewDataSourceCacheDefault).toBeTypeOf('function');
    expect(TectonModule).not.toHaveProperty('RichTreeViewPro');
  });

  it('renders the same markup as the Community component without advanced props', () => {
    const props = {
      items: ITEMS,
      defaultExpandedItems: ['grid'],
      checkboxSelection: true,
      multiSelect: true as const,
      id: 'tree',
    };
    const community = render(<Community.RichTreeView {...props} />);
    const communityHtml = normalize(community.container.innerHTML);
    community.unmount();
    const tecton = render(<RichTreeView {...props} />);
    expect(normalize(tecton.container.innerHTML)).toBe(communityHtml);
  });

  it('passes the Community props through unchanged (selection, expansion, apiRef, ref)', () => {
    const onSelectedItemsChange = vi.fn();
    const onExpandedItemsChange = vi.fn();
    const rootRef = React.createRef<HTMLUListElement>();
    let apiRef: ReturnType<typeof useRichTreeViewApiRef> | undefined;
    function Demo() {
      apiRef = useRichTreeViewApiRef();
      return (
        <RichTreeView
          ref={rootRef}
          apiRef={apiRef}
          items={ITEMS}
          onSelectedItemsChange={onSelectedItemsChange}
          onExpandedItemsChange={onExpandedItemsChange}
          aria-label="products"
        />
      );
    }
    const { container } = render(<Demo />);
    expect(rootRef.current).toBe(screen.getByRole('tree', { name: 'products' }));
    expect(getLabels(container)).toEqual(['Data Grid', 'Date Pickers', 'Charts', 'Tree View']);

    fireEvent.click(screen.getByText('Data Grid'));
    expect(onExpandedItemsChange).toHaveBeenCalledWith(expect.anything(), ['grid']);
    expect(onSelectedItemsChange).toHaveBeenCalledWith(expect.anything(), 'grid');
    expect(getLabels(container)).toContain('Community');

    // Community apiRef is the untouched Community public API.
    expect(apiRef!.current?.getItem?.('charts')).toEqual(ITEMS[2]);
    expect(apiRef!.current).not.toHaveProperty('updateItemChildren');
    act(() => apiRef!.current?.setItemExpansion?.({ itemId: 'pickers', shouldBeExpanded: true }));
    expect(getItem(container, 'pickers')).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps keyboard navigation, label editing and aria attributes', () => {
    const onItemLabelChange = vi.fn();
    const { container } = render(
      <RichTreeView items={ITEMS} isItemEditable onItemLabelChange={onItemLabelChange} />,
    );
    const first = getItem(container, 'grid');
    act(() => first.focus());
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getItem(container, 'grid-community'));

    fireEvent.doubleClick(screen.getByText('Charts'));
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Graphs' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onItemLabelChange).toHaveBeenCalledWith('charts', 'Graphs');
  });

  it('does not forward the advanced props to the DOM when they are explicitly disabled', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <RichTreeView
        items={ITEMS}
        itemsReordering={false}
        virtualization={false}
        disableVirtualization
      />,
    );
    const tree = screen.getByRole('tree');
    expect(tree).not.toHaveAttribute('itemsreordering');
    expect(tree).not.toHaveAttribute('virtualization');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
