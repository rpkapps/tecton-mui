import { render } from '@testing-library/react';
import Icon, { getIconClassName } from '../index.js';

describe('Icon', () => {
  it('renders the Tecton class for name/variant/size and is decorative by default', () => {
    const { container } = render(<Icon name="add" variant="filled" size="large" />);
    const span = container.firstElementChild!;
    expect(span).toHaveClass('tecton-add-filled', 'tecton-icon-lg', 'TectonIcon-root');
    expect(span).toHaveAttribute('aria-hidden', 'true');
  });

  it('exposes an accessible label when titled', () => {
    const { getByRole } = render(<Icon name="calendar" title="Calendar" />);
    expect(getByRole('img', { name: 'Calendar' })).toHaveClass('tecton-calendar-outline');
  });

  it('falls back to an available variant and handles multicolor icons', () => {
    expect(getIconClassName('command', 'outline')).toBe('tecton-command-filled');
    expect(getIconClassName('aam-letters')).toBe('tecton-aam-letters');
  });
});
