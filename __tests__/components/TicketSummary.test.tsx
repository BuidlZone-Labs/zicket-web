import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicketSummary from '@/app/components/TicketSummary';

describe('TicketSummary Component', () => {
  it('renders ticket summary with default active status', () => {
    render(<TicketSummary />);
    
    expect(screen.getByText('Ticket Summary')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Indie Fim Night -Under the starts')).toBeInTheDocument();
    expect(screen.getByText('Jun. 04 2025')).toBeInTheDocument();
    expect(screen.getByText('4:00 pm (UTC +01:00)')).toBeInTheDocument();
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('Verified Access')).toBeInTheDocument();
  });

  it('renders correctly when status is used', () => {
    render(<TicketSummary status="used" />);
    
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });

  it('displays pricing breakdown accurately', () => {
    render(<TicketSummary />);
    
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('SUBTOTAL')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
  });
});
