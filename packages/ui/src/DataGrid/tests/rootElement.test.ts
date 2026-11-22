import { createGridRootRef } from '../core/rootElement.js';

describe('GridRootRef', () => {
  const element = () => document.createElement('div');

  it('attaches observers now when the root is mounted, or as soon as it mounts', () => {
    const ref = createGridRootRef();
    const early = vi.fn();
    ref.observe(early);
    expect(early).not.toHaveBeenCalled();
    const root = element();
    ref.setRef(root);
    expect(ref.current).toBe(root);
    expect(early).toHaveBeenCalledExactlyOnceWith(root);
    const late = vi.fn();
    ref.observe(late);
    expect(late).toHaveBeenCalledExactlyOnceWith(root);
  });

  it('detaches on unsubscribe, and when a different root replaces the attached one', () => {
    const ref = createGridRootRef();
    const first = element();
    const second = element();
    const detach = vi.fn();
    const attach = vi.fn(() => detach);
    const unsubscribe = ref.observe(attach);
    ref.setRef(first);
    // Unmounting keeps the attachment (the effect cleanup tears it down); the same element
    // mounting again (StrictMode) does not attach twice.
    ref.setRef(null);
    expect(ref.current).toBeNull();
    ref.setRef(first);
    expect(attach).toHaveBeenCalledTimes(1);
    expect(detach).not.toHaveBeenCalled();
    ref.setRef(second);
    expect(detach).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenLastCalledWith(second);
    unsubscribe();
    expect(detach).toHaveBeenCalledTimes(2);
    ref.setRef(first);
    expect(attach).toHaveBeenCalledTimes(2);
  });
});
