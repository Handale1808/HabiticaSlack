// components/icons/HabiticaClassIcon.tsx

import type { HabiticaClass } from '@/hooks/useHabiticaStats'

interface HabiticaClassIconProps {
  characterClass: HabiticaClass
  className?: string
}

export function HabiticaClassIcon({
  characterClass,
  className = 'w-5 h-5',
}: HabiticaClassIconProps) {
  switch (characterClass) {
    case 'warrior':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
        </svg>
      )
    case 'rogue':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 20 16 8" />
          <path d="M14 4l6 6-3 1-4-4 1-3Z" />
          <path d="M4 20l2-5 3 3-5 2Z" />
        </svg>
      )
    case 'healer':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 4v16M4 12h16" />
        </svg>
      )
    case 'wizard':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    default:
      return null
  }
}