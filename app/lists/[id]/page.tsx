'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useDoneItems } from '@/hooks/useDoneItems'
import { DoneItemRow } from '@/components/DoneItemRow'

interface DoneItem {
  id: string
  text: string
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)

  const [initialItems, setInitialItems] = useState<DoneItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('DoneItems')
        .select('id, text')
        .eq('list_id', id)
        .order('created_at', { ascending: true })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      setInitialItems(data ?? [])
      setIsLoading(false)
    }

    fetchItems()
  }, [id])

  const { items, handleTextChange, handleBlur, updateStatus, updateError } =
    useDoneItems(initialItems)

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="w-full max-w-lg">
        <Link
          href="/lists"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Back to lists
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Done items</h1>

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && items.length === 0 && (
        <p className="text-sm text-gray-500">No items found for this list.</p>
      )}

      {!isLoading && items.length > 0 && (
        <div className="flex flex-col gap-3 w-full max-w-lg">
          {items.map((item) => (
            <DoneItemRow
              key={item.id}
              id={item.id}
              text={item.text}
              onChange={handleTextChange}
              onBlur={handleBlur}
            />
          ))}
          {updateStatus === 'saving' && (
            <p className="text-gray-500 text-sm">Saving...</p>
          )}
          {updateStatus === 'error' && (
            <p className="text-red-500 text-sm">{updateError}</p>
          )}
        </div>
      )}
    </main>
  )
}