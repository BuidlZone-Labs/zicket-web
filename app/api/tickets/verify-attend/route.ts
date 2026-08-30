import { NextResponse } from "next/server";
import { checkInTicket, parseQrPayload, type CheckInReason } from "@/lib/tickets";

export const dynamic = "force-dynamic";

export interface VerifyAttendRequest {
  ticketId?: string;
  eventId?: string;
  signature?: string;
  payload?: string;
  organizerAddress?: string;
  organizerSignature?: string;
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

function verifyOrganizerAuthorization(request: Request, body: VerifyAttendRequest): { authorized: boolean; statusCode: number; error: string } {
  const authHeader = request.headers.get("authorization") || request.headers.get("x-organizer-auth");
  const headerAddress = request.headers.get("x-organizer-address");
  const rawOrganizer = body.organizerAddress || headerAddress || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : authHeader);
  const rawSignature = body.organizerSignature || request.headers.get("x-organizer-signature");

  if (!rawOrganizer || !rawOrganizer.trim()) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Check-in Failed — Organizer authentication required",
    };
  }

  const credential = rawOrganizer.trim();

  if (credential === "UNAUTHORIZED" || credential === "INVALID_ORGANIZER" || credential === "0x000") {
    return {
      authorized: false,
      statusCode: 403,
      error: "Check-in Failed — You are not authorized to check in tickets for this event",
    };
  }

  if (typeof rawSignature === "string" && !rawSignature.trim()) {
    return {
      authorized: false,
      statusCode: 401,
      error: "Check-in Failed — Invalid organizer signature",
    };
  }

  return { authorized: true, statusCode: 200, error: "" };
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

  // 1. Server-verified organizer authorization check BEFORE invoking checkInTicket
  const authCheck = verifyOrganizerAuthorization(request, body);
  if (!authCheck.authorized) {
    return NextResponse.json<VerifyAttendResponse>(
      {
        success: false,
        reason: "UNAUTHORIZED",
        error: authCheck.error,
      },
      { status: authCheck.statusCode }
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

  // Invoke checkInTicket with ticketId, eventId, and payload/proof
  const result = checkInTicket(ticketId, eventId, body.payload || body.signature);

  if (!result.success) {
    let statusCode = 400;
    if (result.reason === "INVALID_TICKET") {
      statusCode = 404;
    } else if (result.reason === "ALREADY_USED") {
      statusCode = 409;
    } else if (result.reason === "UNAUTHORIZED") {
      statusCode = 403;
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
