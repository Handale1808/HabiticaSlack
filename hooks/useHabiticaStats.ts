// hooks/useHabiticaStats.ts

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type HabiticaClass = 'warrior' | 'rogue' | 'healer' | 'wizard'

export interface HabiticaStats {
  lvl: number
  class: HabiticaClass
  hp: number
  maxHealth: number
  mp: number
  maxMP: number
  exp: number
  toNextLevel: number
}

interface UseHabiticaStatsReturn {
  stats: HabiticaStats | null
  isLoading: boolean
  error: string | null
  refreshStats: () => void
}

const POLL_INTERVAL_MS = 15 * 60 * 1000
const REFRESH_DEBOUNCE_MS = 2000

export function useHabiticaStats(
  habiticaUserId: string,
  habiticaApiToken: string,
): UseHabiticaStatsReturn {
  const [stats, setStats] = useState<HabiticaStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchStats = useCallback(async () => {
    if (!habiticaUserId || !habiticaApiToken) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('https://habitica.com/api/v3/user', {
        method: 'GET',
        headers: {
          'x-api-user': habiticaUserId,
          'x-api-key': habiticaApiToken,
          'x-client': `${habiticaUserId}-habiticaslack`,
        },
      })

      if (!response.ok) {
        throw new Error(`Habitica error: ${response.status}`)
      }

      const json = await response.json()
      const s = json.data.stats

      setStats({
        lvl: s.lvl,
        class: s.class,
        hp: s.hp,
        maxHealth: s.maxHealth,
        mp: s.mp,
        maxMP: s.maxMP,
        exp: s.exp,
        toNextLevel: s.toNextLevel,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Habitica stats')
    } finally {
      setIsLoading(false)
    }
  }, [habiticaUserId, habiticaApiToken])

  useEffect(() => {
    if (!habiticaUserId || !habiticaApiToken) return

    fetchStats()

    const intervalId = setInterval(fetchStats, POLL_INTERVAL_MS)

    return () => {
      clearInterval(intervalId)
    }
  }, [habiticaUserId, habiticaApiToken, fetchStats])

  const refreshStats = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      fetchStats()
    }, REFRESH_DEBOUNCE_MS)
  }, [fetchStats])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return { stats, isLoading, error, refreshStats }
}