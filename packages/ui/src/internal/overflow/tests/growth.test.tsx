import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GROWING_ATTRIBUTE, useMeasureAfterGrowth } from '../growth.js';

/** A row whose ResizeObserver callback (`onResize`) a click on its "resize" button stands for. */
function Row({ requestMeasure, growing }: { requestMeasure: () => void; growing: boolean }) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const onResize = useMeasureAfterGrowth(rootRef, requestMeasure);
  return (
    <div ref={rootRef}>
      <div data-testid="item" {...{ [GROWING_ATTRIBUTE]: growing ? '' : undefined }} />
      <button type="button" onClick={onResize}>
        resize
      </button>
    </div>
  );
}

const resize = () => fireEvent.click(screen.getByRole('button', { name: 'resize' }));

const running = [{ playState: 'running' }] as unknown as Animation[];

describe('useMeasureAfterGrowth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures on every resize while nothing grows', () => {
    const requestMeasure = vi.fn();
    render(<Row requestMeasure={requestMeasure} growing={false} />);
    resize();
    resize();
    expect(requestMeasure).toHaveBeenCalledTimes(2);
  });

  it('holds the measure while an item grows, and measures once when it has grown', () => {
    const requestMeasure = vi.fn();
    render(<Row requestMeasure={requestMeasure} growing />);
    const item = screen.getByTestId('item');
    Object.defineProperty(item, 'getAnimations', { configurable: true, value: () => running });
    resize();
    resize();
    expect(requestMeasure).not.toHaveBeenCalled();
    // Another animation ending (in an item that does not grow) changes nothing.
    item.parentElement!.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(requestMeasure).not.toHaveBeenCalled();
    item.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(requestMeasure).toHaveBeenCalledTimes(1);
    // Nothing was held back: a later end measures nothing.
    item.dispatchEvent(new Event('animationcancel', { bubbles: true }));
    expect(requestMeasure).toHaveBeenCalledTimes(1);
  });

  it('measures when the growing item has no running animation (reduced motion, or done)', () => {
    const requestMeasure = vi.fn();
    render(<Row requestMeasure={requestMeasure} growing />);
    Object.defineProperty(screen.getByTestId('item'), 'getAnimations', {
      configurable: true,
      value: () => [{ playState: 'finished' }],
    });
    resize();
    expect(requestMeasure).toHaveBeenCalledTimes(1);
  });
});
