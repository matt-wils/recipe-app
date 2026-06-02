import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeForm } from '../recipe/RecipeForm';

describe('RecipeForm', () => {
  it('shows an error and does not submit when name is empty', async () => {
    const onSubmit = vi.fn();
    render(<RecipeForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /save recipe/i }));
    expect(screen.getByText(/enter a recipe name/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows an error when there are no ingredients', async () => {
    const onSubmit = vi.fn();
    render(<RecipeForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Toast');
    await userEvent.click(screen.getByRole('button', { name: /save recipe/i }));
    expect(screen.getByText(/at least one ingredient/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a correctly shaped recipe', async () => {
    const onSubmit = vi.fn();
    render(<RecipeForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Toast');
    await userEvent.type(screen.getByLabelText('Ingredient name'), 'bread');
    await userEvent.type(screen.getByLabelText('Tags'), 'breakfast, quick');
    await userEvent.click(screen.getByRole('button', { name: /save recipe/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const [recipe] = onSubmit.mock.calls[0];
    expect(recipe.name).toBe('Toast');
    expect(recipe.ingredients).toHaveLength(1);
    expect(recipe.ingredients[0].name).toBe('bread');
    expect(recipe.tags).toEqual(['breakfast', 'quick']);
    expect(typeof recipe.id).toBe('string');
  });

  it('adds an ingredient row', async () => {
    render(<RecipeForm onSubmit={() => {}} />);
    expect(screen.getAllByLabelText('Ingredient name')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /add ingredient/i }));
    expect(screen.getAllByLabelText('Ingredient name')).toHaveLength(2);
  });

  it('removes an ingredient row', async () => {
    render(<RecipeForm onSubmit={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /add ingredient/i }));
    expect(screen.getAllByLabelText('Ingredient name')).toHaveLength(2);
    const removeButtons = screen.getAllByLabelText('Remove ingredient');
    await userEvent.click(removeButtons[0]);
    expect(screen.getAllByLabelText('Ingredient name')).toHaveLength(1);
  });
});
