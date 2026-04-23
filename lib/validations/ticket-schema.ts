import { z } from "zod"

export const transactionStatusSchema = z.enum([
  "idle",
  "pending",
  "confirmed",
  "failed",
])

export type TransactionStatus = z.infer<typeof transactionStatusSchema>

export const ticketSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0, "Age must be a positive number"),

  // Transaction lifecycle fields
  txHash: z.string().nullable().default(null),
  txStatus: transactionStatusSchema.default("idle"),
  txUpdatedAt: z.string().nullable().default(null),
  txError: z.string().nullable().default(null),
  ticketId: z.string().nullable().default(null),
  eventId: z.string().min(1, "Event ID is required"),
  pricePaid: z.number().min(0).default(0),
})

export type Ticket = z.infer<typeof ticketSchema>

export const ticketPurchaseRequestSchema = z.object({
  eventId: z.string().min(1),
  name: z.string().min(1),
  age: z.number().min(0),
  signedTx: z.string().optional(),
})

export type TicketPurchaseRequest = z.infer<typeof ticketPurchaseRequestSchema>

export const ticketPurchaseResponseSchema = z.object({
  txHash: z.string(),
  ticketId: z.string().optional(),
  status: transactionStatusSchema,
})

export type TicketPurchaseResponse = z.infer<typeof ticketPurchaseResponseSchema>