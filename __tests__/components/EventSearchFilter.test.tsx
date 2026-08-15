import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomDropdown from '@/app/components/explore/CustomDropdown';

describe('Event Search & Filter Functionality', () => {
  it('handles search query input change and filtering trigger', () => {
    const handleSearch = vi.fn();
    render(
      <input
        type="text"
        placeholder="Search events by title or location..."
        onChange={(e) => handleSearch(e.target.value)}
      />
    );

    const input = screen.getByPlaceholderText(/Search events/i);
    fireEvent.change(input, { target: { value: 'Web3 Summit' } });

    expect(handleSearch).toHaveBeenCalledWith('Web3 Summit');
  });

  it('filters events by eventType dropdown selection', () => {
    const handleFilterChange = vi.fn();
    const eventTypes = ['Music', 'Tech & Web3', 'Art & Culture'];

    render(
      <CustomDropdown
        label="Event Type"
        options={eventTypes}
        value={null}
        onChange={handleFilterChange}
      />
    );

    const dropdownBtn = screen.getByRole('button', { name: /Event Type/i });
    fireEvent.click(dropdownBtn);

    const techOption = screen.getByText('Tech & Web3');
    fireEvent.click(techOption);

    expect(handleFilterChange).toHaveBeenCalledWith('Tech & Web3');
  });
});
