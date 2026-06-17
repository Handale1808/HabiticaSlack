// context/UserContext.tsx

'use client'

import { createContext, useContext, useState } from 'react'

interface User {
  id: string
  name: string
}

interface UserContextValue {
  currentUser: User | null
  setCurrentUser: (user: User) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used inside UserProvider')
  }
  return context
}