// app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/useLogin'
import { useUser } from '@/context/UserContext'

export default function LoginPage() {
  const [nameInput, setNameInput] = useState('')
  const [habiticaUserIdInput, setHabiticaUserIdInput] = useState('')
  const [habiticaApiTokenInput, setHabiticaApiTokenInput] = useState('')

  const [credentialPromptUserId, setCredentialPromptUserId] = useState<string | null>(null)
  const [promptHabiticaUserId, setPromptHabiticaUserId] = useState('')
  const [promptHabiticaApiToken, setPromptHabiticaApiToken] = useState('')

  const { createUser, updateUserCredentials, existingUsers, isLoading, error, updateLoading, updateError } = useLogin()
  const { setCurrentUser } = useUser()
  const router = useRouter()

  const handleCreate = async () => {
    if (!nameInput.trim() || !habiticaUserIdInput.trim() || !habiticaApiTokenInput.trim()) return
    const user = await createUser(nameInput.trim(), habiticaUserIdInput.trim(), habiticaApiTokenInput.trim())
    if (user) {
      setCurrentUser(user)
      router.push('/upload')
    }
  }

  const handleSelectUser = (user: { id: string; name: string; habitica_user_id: string; habitica_api_token: string }) => {
    if (user.habitica_user_id && user.habitica_api_token) {
      setCurrentUser(user)
      router.push('/upload')
    } else {
      setCredentialPromptUserId(user.id)
    }
  }

  const handleCredentialSubmit = async (userId: string) => {
    if (!promptHabiticaUserId.trim() || !promptHabiticaApiToken.trim()) return
    const updated = await updateUserCredentials(userId, promptHabiticaUserId.trim(), promptHabiticaApiToken.trim())
    if (updated) {
      setCurrentUser(updated)
      router.push('/upload')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Who are you?</h1>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your name"
          className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="text"
          value={habiticaUserIdInput}
          onChange={(e) => setHabiticaUserIdInput(e.target.value)}
          placeholder="Habitica User ID"
          className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="password"
          value={habiticaApiTokenInput}
          onChange={(e) => setHabiticaApiTokenInput(e.target.value)}
          placeholder="Habitica API Token"
          className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleCreate}
          disabled={isLoading || !nameInput.trim() || !habiticaUserIdInput.trim() || !habiticaApiTokenInput.trim()}
          className="bg-black text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create and login'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {existingUsers.length > 0 && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <p className="text-sm text-gray-500">Or continue as:</p>
          {existingUsers.map((user) => (
            <div key={user.id} className="flex flex-col gap-2">
              <button
                onClick={() => handleSelectUser(user)}
                className="border border-gray-200 rounded px-4 py-2 text-sm text-left hover:bg-gray-50"
              >
                {user.name}
              </button>

              {credentialPromptUserId === user.id && (
                <div className="flex flex-col gap-2 pl-4 border-l border-gray-300">
                  <p className="text-xs text-gray-500">Enter Habitica credentials for {user.name}:</p>
                  <input
                    type="text"
                    value={promptHabiticaUserId}
                    onChange={(e) => setPromptHabiticaUserId(e.target.value)}
                    placeholder="Habitica User ID"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="password"
                    value={promptHabiticaApiToken}
                    onChange={(e) => setPromptHabiticaApiToken(e.target.value)}
                    placeholder="Habitica API Token"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    onClick={() => handleCredentialSubmit(user.id)}
                    disabled={updateLoading || !promptHabiticaUserId.trim() || !promptHabiticaApiToken.trim()}
                    className="bg-black text-white rounded px-3 py-2 text-sm disabled:opacity-50"
                  >
                    {updateLoading ? 'Saving...' : 'Save and login'}
                  </button>
                  {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}