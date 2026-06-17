import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type UploadStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseUploadReturn {
  upload: (file: File, userId: string) => Promise<void>
  reset: () => void
  status: UploadStatus
  aiResponse: unknown | null
  errorMessage: string | null
}

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const mimeType = file.type
      const base64 = result.split(',')[1]
      resolve({ base64, mimeType })
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function useUpload(): UseUploadReturn {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [aiResponse, setAiResponse] = useState<unknown | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const upload = async (file: File, userId: string) => {
    setStatus('loading')
    setAiResponse(null)
    setErrorMessage(null)

    try {
      const { base64, mimeType } = await fileToBase64(file)

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'anthropic/claude-haiku-4-5',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'You are analysing a handwritten done list.\nReturn JSON.\n{\n  "tasks": [\n    {\n      "text": "Updated payment form"\n    }\n  ]\n}\nOnly return valid JSON.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text()
        throw new Error(`OpenRouter error: ${openRouterResponse.status} — ${errText}`)
      }

      const rawAiResponse = await openRouterResponse.json()

      const storagePath = `${userId}/${Date.now()}-${file.name}`

      const { error: storageError } = await supabase.storage
        .from('uploads')
        .upload(storagePath, file, { contentType: file.type })

      if (storageError) {
        throw new Error(`Storage error: ${storageError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(storagePath)

      const { error: dbError } = await supabase
        .from('Uploads')
        .insert({
          user_id: userId,
          image_url: publicUrlData.publicUrl,
          ai_response: rawAiResponse,
        })

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }

      setAiResponse(rawAiResponse)
      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setAiResponse(null)
    setErrorMessage(null)
  }

  return { upload, reset, status, aiResponse, errorMessage }
}