// hooks/useLogin.ts

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface User {
  id: string
  name: string
  habitica_user_id: string
  habitica_api_token: string
  slack_list_webhook: string | null
  slack_summary_webhook: string | null
}

interface UseLoginReturn {
  createUser: (name: string, habiticaUserId: string, habiticaApiToken: string, slackListWebhook: string, slackSummaryWebhook: string) => Promise<User | null>
  updateUserCredentials: (id: string, habiticaUserId: string, habiticaApiToken: string) => Promise<User | null>
  existingUsers: User[]
  isLoading: boolean
  error: string | null
  updateLoading: boolean
  updateError: string | null
}

export function useLogin(): UseLoginReturn {
  const [existingUsers, setExistingUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('Users')
        .select('id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        return
      }

      setExistingUsers(data ?? [])
    }

    fetchUsers()
  }, [])

  const createUser = async (
    name: string,
    habiticaUserId: string,
    habiticaApiToken: string,
    slackListWebhook: string,
    slackSummaryWebhook: string,
  ): Promise<User | null> => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('Users')
      .insert({ name, habitica_user_id: habiticaUserId, habitica_api_token: habiticaApiToken, slack_list_webhook: slackListWebhook, slack_summary_webhook: slackSummaryWebhook })
      .select('id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook')
      .single()

    setIsLoading(false)

    if (error) {
      setError(error.message)
      return null
    }

    return data
  }

  const updateUserCredentials = async (
    id: string,
    habiticaUserId: string,
    habiticaApiToken: string,
  ): Promise<User | null> => {
    setUpdateLoading(true)
    setUpdateError(null)

    const { data, error } = await supabase
      .from('Users')
      .update({ habitica_user_id: habiticaUserId, habitica_api_token: habiticaApiToken })
      .eq('id', id)
      .select('id, name, habitica_user_id, habitica_api_token, slack_list_webhook, slack_summary_webhook')
      .single()

    setUpdateLoading(false)

    if (error) {
      setUpdateError(error.message)
      return null
    }

    return data
  }

  return {
    createUser,
    updateUserCredentials,
    existingUsers,
    isLoading,
    error,
    updateLoading,
    updateError,
  }
}