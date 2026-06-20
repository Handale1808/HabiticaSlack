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
          <ellipse cx="12" cy="15" rx="5" ry="4" />
          <circle cx="6" cy="8" r="2" />
          <circle cx="10.5" cy="5.5" r="2" />
          <circle cx="15.5" cy="5.5" r="2" />
          <circle cx="19" cy="9" r="2" />
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
          <path d="M12 3c-4 2-7 7-7 12 0 2 1.5 3.5 3.5 3.5 5 0 10-3 11-7.5 1-4.5-2.5-8-7.5-8Z" />
          <path d="M12 3v15" />
          <path d="M9 8l3 1M8 12l4 1M8 16l4 1" />
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
          <path d="M12 21c-4-2-7-6-7-11 0-3 2-6 7-7 5 1 7 4 7 7 0 5-3 9-7 11Z" />
          <path d="M12 21V7" />
          <path d="M12 11l-3-2M12 15l3-2" />
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
          <path d="M8 9c0-3 1.5-5 4-5s4 2 4 5" />
          <path d="M7 9h10l-1 2c1 1 1.5 2.5 1.5 4 0 3.5-2.5 6-5.5 6s-5.5-2.5-5.5-6c0-1.5.5-3 1.5-4Z" />
        </svg>
      )
    default:
      return null
  }
}