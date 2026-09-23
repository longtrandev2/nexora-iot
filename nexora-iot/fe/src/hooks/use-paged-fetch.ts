import { useEffect, useRef, useState } from 'react'
import type { Paged } from '@/types/iot'

/**
 * Generic server-side paginated fetch for the history pages: refetches
 * whenever the (applied) query changes; keeps last rows while loading so
 * the table does not flash empty between pages.
 */
export function usePagedFetch<T, Q extends object>(
  fetchPage: (query: Q) => Promise<Paged<T>>,
  query: Q,
): { rows: T[]; total: number; loading: boolean } {
  const [rows, setRows] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const fetchRef = useRef(fetchPage)
  fetchRef.current = fetchPage
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchRef.current(query)
      .then((result) => {
        if (cancelled) return
        setRows(result.items)
        setTotal(result.total)
      })
      .catch(() => {
        if (!cancelled) {
          setRows([])
          setTotal(0)
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey IS the dep
  }, [queryKey])

  return { rows, total, loading }
}
