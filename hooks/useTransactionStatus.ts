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

    const poll = useCallback(async (txHash: string) => {
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

        try {
            const result = await fetchTransactionStatus(txHash)
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
            // Network error — keep polling in the background, but surface a
            // "stalled" state after a couple of consecutive failures so the
            // user isn't left staring at a silent spinner.
            consecutiveFailuresRef.current += 1
            setState((s) => ({
                ...s,
                status:
                    s.status === "pending" && consecutiveFailuresRef.current >= STALL_THRESHOLD
                        ? "stalled"
                        : s.status,
                attempts: s.attempts + 1,
            }))
        }
    }, [maxAttempts, stopPolling])

    /**
     * Fires one immediate poll without resetting the interval/attempt count.
     * Intended for a manual "Check Connection" / "Retry Status Check" action
     * while stalled.
     */
    const checkConnection = useCallback(() => {
        const { txHash } = stateRef.current
        if (txHash) poll(txHash)
    }, [poll])

    /**
     * Call this as soon as you have a transaction hash from the wallet.
     * It sets status to "pending" and begins polling.
     */
    const startTracking = useCallback(
        (txHash: string) => {
            stopPolling()
            consecutiveFailuresRef.current = 0

            setState({
                status: "pending",
                txHash,
                updatedAt: new Date().toISOString(),
                error: null,
                attempts: 0,
            })

            // Poll immediately, then on interval
            poll(txHash)
            intervalRef.current = setInterval(() => poll(txHash), pollIntervalMs)
        },
        [poll, pollIntervalMs, stopPolling]
    )

    /** Reset everything back to idle */
    const reset = useCallback(() => {
        stopPolling()
        consecutiveFailuresRef.current = 0
        setState(INITIAL_STATE)
    }, [stopPolling])

    // Cleanup on unmount
    useEffect(() => () => stopPolling(), [stopPolling])

    return { ...state, startTracking, reset, checkConnection }
}