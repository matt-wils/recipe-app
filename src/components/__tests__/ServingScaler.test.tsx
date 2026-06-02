import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServingScaler } from '../recipe/ServingScaler';

describe('ServingScaler', () => {
  it('renders the current serving count', () => {
    render(<ServingScaler servings={4} onChange={() => {}} />);
    expect(screen.getByLabelText('Servings count')).toHaveTextContent('4');
  });

  it('increments on +', async () => {
    const onChange = vi.fn();
    render(<ServingScaler servings={4} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase servings'));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('decrements on -', async () => {
    const onChange = vi.fn();
    render(<ServingScaler servings={4} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease servings'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not go below 1', async () => {
    const onChange = vi.fn();
    render(<ServingScaler servings={1} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease servings'));
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
