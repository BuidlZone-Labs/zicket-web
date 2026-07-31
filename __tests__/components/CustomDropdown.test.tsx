import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomDropdown from '@/app/components/explore/CustomDropdown';

describe('CustomDropdown Component', () => {
  const defaultProps = {
    label: 'Category',
    options: ['Music', 'Tech', 'Art'],
    value: null,
    onChange: vi.fn(),
  };

  it('renders dropdown with label', () => {
    render(<CustomDropdown {...defaultProps} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('opens menu and displays options on click', () => {
    render(<CustomDropdown {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: /Category/i });
    fireEvent.click(button);

    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Art')).toBeInTheDocument();
  });

  it('calls onChange with selected option when clicked', () => {
    const handleChange = vi.fn();
    render(<CustomDropdown {...defaultProps} onChange={handleChange} />);
    
    const button = screen.getByRole('button', { name: /Category/i });
    fireEvent.click(button);

    const option = screen.getByText('Tech');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('Tech');
  });

  it('calls onChange with null when Show All is clicked', () => {
    const handleChange = vi.fn();
    render(<CustomDropdown {...defaultProps} onChange={handleChange} value="Music" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const showAllOption = screen.getByText('Show All');
    fireEvent.click(showAllOption);

    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
