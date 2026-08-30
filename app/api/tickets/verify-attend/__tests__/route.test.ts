import { describe, expect, it, beforeEach } from 'vitest';
import { POST } from '../route';
import { resetCheckInState, buildTicketQrPayload, getTicketById } from '@/lib/tickets';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Organizer-Address': 'GORGANIZER123456789',
};

describe('POST /api/tickets/verify-attend API Route', () => {
  beforeEach(() => {
    resetCheckInState();
  });

  it('returns 200 with success status for a valid live ticket ID with organizer auth', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ ticketId: 'tkt-crypto-build-live', organizerAddress: 'GORGANIZER123456789' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('Check-in Successful');
    expect(body.ticket.id).toBe('tkt-crypto-build-live');
    expect(body.checkedInAt).toBeDefined();
  });

  it('returns 401 Unauthorized when organizer authorization is missing', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: 'tkt-crypto-build-live' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('UNAUTHORIZED');
  });

  it('returns 403 Forbidden when unauthorized organizer address is passed', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Organizer-Address': 'UNAUTHORIZED' },
      body: JSON.stringify({ ticketId: 'tkt-crypto-build-live', organizerAddress: 'UNAUTHORIZED' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('UNAUTHORIZED');
  });

  it('returns 200 for a valid Base64 encoded QR payload with organizer auth', async () => {
    const ticket = getTicketById('tkt-crypto-build-live')!;
    const rawPayload = buildTicketQrPayload(ticket);

    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ payload: rawPayload, organizerAddress: 'GORGANIZER123456789' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.ticket.id).toBe('tkt-crypto-build-live');
  });

  it('returns 400 when trying to check in an upcoming ticket before event starts', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ ticketId: 'tkt-solana-vip', organizerAddress: 'GORGANIZER123456789' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('UPCOMING');
    expect(body.error).toContain('Event has not started yet');
  });

  it('returns 409 when attempting to check in an already used ticket', async () => {
    // First check-in
    const req1 = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ ticketId: 'tkt-crypto-build-live', organizerAddress: 'GORGANIZER123456789' }),
    });
    await POST(req1);

    // Second check-in
    const req2 = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ ticketId: 'tkt-crypto-build-live', organizerAddress: 'GORGANIZER123456789' }),
    });

    const res = await POST(req2);
    expect(res.status).toBe(409);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('ALREADY_USED');
    expect(body.error).toContain('Ticket Already Used');
  });

  it('returns 404 for non-existent ticket ID', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: JSON.stringify({ ticketId: 'tkt-unknown-999', organizerAddress: 'GORGANIZER123456789' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('INVALID_TICKET');
  });

  it('returns 400 for malformed or missing JSON body', async () => {
    const req = new Request('http://localhost:3000/api/tickets/verify-attend', {
      method: 'POST',
      headers: AUTH_HEADERS,
      body: 'invalid-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.reason).toBe('INVALID_PAYLOAD');
  });
});
