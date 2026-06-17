// hooks/useLogin.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface User {
  id: string
  name: string
}

interface UseLoginReturn {
  createUser: (name: string) => Promise<User | null>
  existingUsers: User[]
  isLoading: boolean
  error: string | null
}

export function useLogin(): UseLoginReturn {
  const [existingUsers, setExistingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('id, name')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setExistingUsers(data ?? [])
    }

    fetchUsers()
  }, [])

  const createUser = async (name: string): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('Users')
      .insert({ name })
      .select('id, name')
      .single()

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return null
    }

    return data
  }

  return { createUser, existingUsers, isLoading, error }
}