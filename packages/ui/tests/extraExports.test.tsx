import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { visuallyHidden as utilsVisuallyHidden } from '@mui/utils';
import { visuallyHidden, Fade } from '../src/index.js';
import type { TransitionProps } from '../src/index.js';
import type { TransitionProps as SubpathTransitionProps } from '../src/transitions/index.js';

describe('MUI exports that the Material root index does not list', () => {
  it('re-exports visuallyHidden from @mui/utils at the root', () => {
    expect(visuallyHidden).toBe(utilsVisuallyHidden);
    render(<span style={visuallyHidden as React.CSSProperties}>sorted descending</span>);
    expect(screen.getByText('sorted descending')).toHaveStyle({ position: 'absolute' });
  });

  it('exposes TransitionProps at the root and from the transitions subpath', () => {
    // A custom transition written the way the MUI docs show it.
    const Custom = React.forwardRef<
      HTMLDivElement,
      TransitionProps & { children: React.ReactElement }
    >((props, ref) => <Fade ref={ref} {...props} />);
    const subpath: SubpathTransitionProps = { in: true, timeout: 0 };
    render(
      <Custom {...subpath}>
        <div>shown</div>
      </Custom>,
    );
    expect(screen.getByText('shown')).toBeInTheDocument();
  });
});
