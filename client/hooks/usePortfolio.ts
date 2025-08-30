import { useCallback, useEffect, useState } from 'react'
import type { ApiResponse } from '@/types/api'
import type { PortfolioCategoryMap } from '@/types/portfolio'
import { fetchPortfolioData } from '@/lib/portfolio-data'

interface UsePortfolioState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePortfolioProjects(): UsePortfolioState<PortfolioCategoryMap> {
  const [state, setState] = useState<{
    data: PortfolioCategoryMap | null
    loading: boolean
    error: string | null
  }>({ data: null, loading: true, error: null })

  const query = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res: ApiResponse<PortfolioCategoryMap> = await fetchPortfolioData()
      if (res.success) {
        setState({ data: res.data || null, loading: false, error: null })
      } else {
        setState({ data: null, loading: false, error: res.error || 'Unknown error' })
      }
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }, [])

  useEffect(() => {
    query()
  }, [query])

  return { ...state, refetch: query }
}
