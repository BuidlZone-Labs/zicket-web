"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type TransactionStatus = "idle" | "pending" | "stalled" | "confirmed" | "failed"

/** Consecutive network failures before we surface a "stalled" state to the user. */
const STALL_THRESHOLD = 2

export interface TransactionState {
    status: TransactionStatus
    txHash: string | null
    updatedAt: string | null
    error: string | null
    attempts: number
}

export interface UseTransactionStatusOptions {
    pollIntervalMs?: number
    maxAttempts?: number
    onConfirmed?: (txHash: string) => void
    onFailed?: (error: string) => void
}

/** Fetches the current on-chain status for a tx hash from the status API. */
async function fetchTransactionStatus(
    txHash: string
): Promise<{ status: "pending" | "confirmed" | "failed"; error?: string }> {
    const res = await fetch(`/api/transactions/${txHash}/status`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
}

const INITIAL_STATE: TransactionState = {
    status: "idle",
    txHash: null,
    updatedAt: null,
    error: null,
    attempts: 0,
}

/**
 * Polls the transaction status API for a tx hash and exposes its lifecycle
 * (idle → pending → stalled/confirmed/failed) plus imperative controls. Handles
 * timeout, transient-network "stalled" detection, and overlapping-request
 * guarding so callers get a single reliable status stream.
 *
 * @returns the current state spread with `startTracking`, `reset`, and
 * `checkConnection`.
 */
export function useTransactionStatus(options: UseTransactionStatusOptions = {}) {
    const {
        pollIntervalMs = 3_000,
        maxAttempts = 20,
        onConfirmed,
        onFailed,
    } = options

    const [state, setState] = useState<TransactionState>(INITIAL_STATE)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const stateRef = useRef(state)
    stateRef.current = state
    const consecutiveFailuresRef = useRef(0)
    // Guards against the interval poll and a manual checkConnection() call
    // overlapping — without it, concurrent requests double-increment
    // `attempts`/`consecutiveFailuresRef` and can burn the attempt budget
    // early from repeated manual clicks.
    const inFlightRef = useRef(false)
    // Bumped by startTracking/reset/unmount. A poll captures the generation it
    // was started for and drops its result if the generation has moved on, so a
    // response that lands after the caller reset or started a new tx can't write
    // stale state or fire onConfirmed/onFailed for an abandoned hash.
    const generationRef = useRef(0)

    // Stable callbacks so the interval closure doesn't go stale
    const onConfirmedRef = useRef(onConfirmed)
    const onFailedRef = useRef(onFailed)
    useEffect(() => { onConfirmedRef.current = onConfirmed }, [onConfirmed])
    useEffect(() => { onFailedRef.current = onFailed }, [onFailed])

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    /**
     * Runs one status check: skips if a request is already in flight or the tx
     * is terminal, times out after `maxAttempts`, and flips to "stalled" after
     * repeated network failures. Fires onConfirmed/onFailed on terminal states.
     */
    const poll = useCallback(async (txHash: string, generation: number) => {
        if (inFlightRef.current) return
        if (generation !== generationRef.current) return
        const current = stateRef.current

        // Guard: stop if already terminal or exceeded attempts
        if (
            current.status === "confirmed" ||
            current.status === "failed" ||
            current.attempts >= maxAttempts
        ) {
            stopPolling()
            // Mark as failed if we ran out of attempts while still waiting
            if (
                current.attempts >= maxAttempts &&
                (current.status === "pending" || current.status === "stalled")
            ) {
                setState((s) => ({
                    ...s,
                    status: "failed",
                    error: "Transaction timed out. Please check your wallet.",
                    updatedAt: new Date().toISOString(),
                }))
                onFailedRef.current?.("Transaction timed out. Please check your wallet.")
            }
            return
        }

        inFlightRef.current = true
        try {
            const result = await fetchTransactionStatus(txHash)
            // The tracking session was reset or replaced while this was in
            // flight — drop the result rather than clobber the new state.
            if (generation !== generationRef.current) return
            consecutiveFailuresRef.current = 0

            setState((s) => ({
                ...s,
                status: result.status,
                error: result.error ?? null,
                updatedAt: new Date().toISOString(),
                attempts: s.attempts + 1,
            }))

            if (result.status === "confirmed") {
                stopPolling()
                onConfirmedRef.current?.(txHash)
            } else if (result.status === "failed") {
                stopPolling()
                onFailedRef.current?.(result.error ?? "Transaction failed")
            }
        } catch (err) {
            if (generation !== generationRef.current) return
            // Network error — keep polling in the background, but surface a
            // "stalled" state after a couple of consecutive failures so the
            // user isn't left staring at a silent spinner. Clear any lingering
            // error text so a prior poll's message doesn't show under the
            // "Network Issue Detected" heading.
            consecutiveFailuresRef.current += 1
            setState((s) => {
                const nextStalled =
                    s.status === "pending" && consecutiveFailuresRef.current >= STALL_THRESHOLD
                return {
                    ...s,
                    status: nextStalled ? "stalled" : s.status,
                    error: nextStalled ? null : s.error,
                    attempts: s.attempts + 1,
                }
            })
        } finally {
            inFlightRef.current = false
        }
    }, [maxAttempts, stopPolling])

    /**
     * Fires one immediate poll without resetting the interval/attempt count.
     * Intended for a manual "Check Connection" / "Retry Status Check" action
     * while stalled.
     */
    const checkConnection = useCallback(() => {
        const { txHash } = stateRef.current
        if (txHash) poll(txHash, generationRef.current)
    }, [poll])

    /**
     * Call this as soon as you have a transaction hash from the wallet.
     * It sets status to "pending" and begins polling.
     */
    const startTracking = useCallback(
        (txHash: string) => {
            stopPolling()
            consecutiveFailuresRef.current = 0
            const generation = ++generationRef.current

            const next: TransactionState = {
                status: "pending",
                txHash,
                updatedAt: new Date().toISOString(),
                error: null,
                attempts: 0,
            }
            // Prime the ref synchronously (it otherwise only updates on render)
            // so the immediate poll below sees this new tx, not the previous
            // one's terminal state — which would short-circuit the first check.
            stateRef.current = next
            setState(next)

            // Poll immediately, then on interval
            poll(txHash, generation)
            intervalRef.current = setInterval(() => poll(txHash, generation), pollIntervalMs)
        },
        [poll, pollIntervalMs, stopPolling]
    )

    /** Reset everything back to idle, invalidating any in-flight poll. */
    const reset = useCallback(() => {
        stopPolling()
        consecutiveFailuresRef.current = 0
        generationRef.current++
        setState(INITIAL_STATE)
    }, [stopPolling])

    // Cleanup on unmount — invalidate in-flight polls so they don't setState
    // after the component is gone.
    useEffect(() => () => {
        generationRef.current++
        stopPolling()
    }, [stopPolling])

    return { ...state, startTracking, reset, checkConnection }
}