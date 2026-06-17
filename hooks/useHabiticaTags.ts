import { useState, useEffect } from 'react'

interface HabiticaTag {
  id: string
  name: string
}

interface UseHabiticaTagsReturn {
  tags: HabiticaTag[]
  createTag: (name: string) => Promise<HabiticaTag | null>
  isLoading: boolean
  createLoading: boolean
  error: string | null
}

export function useHabiticaTags(
  habiticaUserId: string,
  habiticaApiToken: string,
): UseHabiticaTagsReturn {
  const [tags, setTags] = useState<HabiticaTag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const headers = {
    'Content-Type': 'application/json',
    'x-api-user': habiticaUserId,
    'x-api-key': habiticaApiToken,
    'x-client': `${habiticaUserId}-habiticaslack`,
  }

  useEffect(() => {
    if (!habiticaUserId || !habiticaApiToken) return

    const fetchTags = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('https://habitica.com/api/v3/tags', {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          throw new Error(`Habitica error: ${response.status}`)
        }

        const json = await response.json()
        setTags(json.data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tags')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [habiticaUserId, habiticaApiToken])

  const createTag = async (name: string): Promise<HabiticaTag | null> => {
    setCreateLoading(true)
    setError(null)

    try {
      const response = await fetch('https://habitica.com/api/v3/tags', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error(`Habitica error: ${response.status}`)
      }

      const json = await response.json()
      const newTag: HabiticaTag = json.data

      setTags((prev) => [...prev, newTag])
      return newTag
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
      return null
    } finally {
      setCreateLoading(false)
    }
  }

  return { tags, createTag, isLoading, createLoading, error }
}