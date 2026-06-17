// components/Nav.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/login', label: 'Login' },
  { href: '/upload', label: 'Upload' },
  { href: '/lists', label: 'Lists' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="w-full border-b border-gray-800 px-8 py-4">
      <ul className="flex gap-6">
        {navItems.map((item) => {
          const isActive =
            item.href === '/lists'
              ? pathname.startsWith('/lists')
              : pathname === item.href

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? 'text-white font-semibold underline underline-offset-4'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}