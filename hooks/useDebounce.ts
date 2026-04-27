"use client"

import { useState, useEffect } from "react"

/**
 * Hook to debounce a value - delays updating the value until after delay milliseconds
 * have passed since the last change.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedSearch = useDebounce(searchQuery, 500)
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     searchAPI(debouncedSearch)
 *   }
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that combines input state with debouncing.
 * Returns the immediate value (for the input), the debounced value (for API calls),
 * and a setter function.
 *
 * @param initialValue - Initial value for the input
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns [value, debouncedValue, setValue]
 *
 * @example
 * const [search, debouncedSearch, setSearch] = useDebouncedState('', 500)
 *
 * // Use `search` for input value
 * <input value={search} onChange={(e) => setSearch(e.target.value)} />
 *
 * // Use `debouncedSearch` for API calls
 * useEffect(() => {
 *   searchAPI(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}
