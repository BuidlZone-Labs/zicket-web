import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventCard from '@/app/components/EventCard';

describe('EventCard Component', () => {
  it('renders event details with provided props', () => {
    render(
      <EventCard
        title="Web3 Developer Summit"
        date="Oct 12, 2025"
        time="10:00 AM"
        location="San Francisco, CA"
        price="$50.00"
      />
    );

    expect(screen.getByText('Web3 Developer Summit')).toBeInTheDocument();
    expect(screen.getByText('Oct 12, 2025')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders default fallback values when props are omitted', () => {
    render(<EventCard />);

    expect(screen.getByText('Zicket Caption')).toBeInTheDocument();
    expect(screen.getByText('London, UK')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('contains a button for getting tickets', () => {
    render(<EventCard title="Test Festival" />);
    const button = screen.getByRole('button', { name: /Get tickets for Test Festival/i });
    expect(button).toBeInTheDocument();
  });
});
