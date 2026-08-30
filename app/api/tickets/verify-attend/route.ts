import { NextResponse } from "next/server";
import { checkInTicket, parseQrPayload, type CheckInReason } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export interface VerifyAttendRequest {
  ticketId?: string;
  eventId?: string;
  signature?: string;
  payload?: string;
}

export interface VerifyAttendResponse {
  success: boolean;
  message?: string;
  reason?: CheckInReason;
  error?: string;
  ticket?: unknown;
  event?: unknown;
  checkedInAt?: string;
}

export async function POST(request: Request) {
  let body: VerifyAttendRequest;
  try {
    body = (await request.json()) as VerifyAttendRequest;
  } catch {
    return NextResponse.json<VerifyAttendResponse>(
      {
        success: false,
        reason: "INVALID_PAYLOAD",
        error: "Check-in Failed — Invalid QR Code",
      },
      { status: 400 }
    );
  }

  let ticketId = body.ticketId?.trim();
  let eventId = body.eventId?.trim();

  // If a raw payload string was passed instead of direct ticketId, parse it
  if (!ticketId && body.payload) {
    const parsed = parseQrPayload(body.payload);
    if (parsed) {
      ticketId = parsed.ticketId;
      if (!eventId && parsed.eventId) {
        eventId = parsed.eventId;
      }
    }
  }

  if (!ticketId) {
    return NextResponse.json<VerifyAttendResponse>(
      {
        success: false,
        reason: "INVALID_PAYLOAD",
        error: "Check-in Failed — Invalid QR Code",
      },
      { status: 400 }
    );
  }

  const result = checkInTicket(ticketId, eventId);

  if (!result.success) {
    let statusCode = 400;
    if (result.reason === "INVALID_TICKET") {
      statusCode = 404;
    } else if (result.reason === "ALREADY_USED") {
      statusCode = 409;
    }

    return NextResponse.json<VerifyAttendResponse>(
      {
        success: false,
        reason: result.reason,
        error: result.error ?? "Check-in Failed",
        ticket: result.ticket,
        event: result.event,
      },
      { status: statusCode }
    );
  }

  return NextResponse.json<VerifyAttendResponse>({
    success: true,
    message: "Check-in Successful — Valid Ticket",
    ticket: result.ticket,
    event: result.event,
    checkedInAt: result.checkedInAt,
  });
}
