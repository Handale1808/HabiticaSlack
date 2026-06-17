// app/login/page.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLogin } from '@/hooks/useLogin'
import { useUser } from '@/context/UserContext'

export default function LoginPage() {
  const [nameInput, setNameInput] = useState('')
  const { createUser, existingUsers, isLoading, error } = useLogin()
  const { setCurrentUser } = useUser()
  const router = useRouter()

  const handleCreate = async () => {
    if (!nameInput.trim()) return
    const user = await createUser(nameInput.trim())
    if (user) {
      setCurrentUser(user)
      router.push('/upload')
    }
  }

  const handleSelectUser = (user: { id: string; name: string }) => {
    setCurrentUser(user)
    router.push('/upload')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Who are you?</h1>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Enter your name"
          className="border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleCreate}
          disabled={isLoading || !nameInput.trim()}
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
            <button
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="border border-gray-200 rounded px-4 py-2 text-sm text-left hover:bg-gray-50"
            >
              {user.name}
            </button>
          ))}
        </div>
      )}
    </main>
  )
}