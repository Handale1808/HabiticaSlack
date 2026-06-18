// components/Nav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { HabiticaClassIcon } from "@/components/HabiticaClassIcon";
import { HabiticaStatBars } from "@/components/HabiticaStatBars";

const navItems = [
  { href: "/login", label: "Login" },
  { href: "/upload", label: "Upload" },
  { href: "/lists", label: "Lists" },
];

export function Nav() {
  const pathname = usePathname();
  const { currentUser, habiticaStats } = useUser();

  const hasHabiticaCredentials =
    !!currentUser?.habitica_user_id && !!currentUser?.habitica_api_token;

  return (
    <nav className="w-full border-b border-gray-800 px-8 py-4 flex justify-between items-center">
      <ul className="flex gap-6">
        {navItems.map((item) => {
          const isActive =
            item.href === "/lists"
              ? pathname.startsWith("/lists")
              : pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm transition-colors ${
                  isActive
                    ? "text-white font-semibold underline underline-offset-4"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {hasHabiticaCredentials && habiticaStats && (
        <div className="flex items-center gap-2 text-gray-300">
          <HabiticaClassIcon
            characterClass={habiticaStats.class}
            className="w-5 h-5"
          />
          <HabiticaStatBars
            lvl={habiticaStats.lvl}
            hp={habiticaStats.hp}
            maxHealth={habiticaStats.maxHealth}
            mp={habiticaStats.mp}
            maxMP={habiticaStats.maxMP}
            exp={habiticaStats.exp}
            toNextLevel={habiticaStats.toNextLevel}
          />
        </div>
      )}
    </nav>
  );
}
