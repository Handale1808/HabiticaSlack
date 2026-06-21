// components/Nav.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { HabiticaClassIcon } from "@/components/HabiticaClassIcon";
import { HabiticaStatBars } from "@/components/HabiticaStatBars";
import { LinkButton } from "@/components/ui/LinkButton";
import { getSprite, spriteSheets } from "@/lib/sprites/registry";
import { getSpriteBackgroundStyle } from "@/lib/sprites/getSpriteBackgroundStyle";

const cardSprite = getSprite("medival", 20);
const cardBackgroundStyle = getSpriteBackgroundStyle(
  spriteSheets.medival,
  cardSprite,
);

const navItems = [
  { href: "/login", label: "login" },
  { href: "/upload", label: "upload" },
  { href: "/lists", label: "lists" },
];

export function Nav() {
  const pathname = usePathname();
  const { currentUser, habiticaStats } = useUser();

  const hasHabiticaCredentials =
    !!currentUser?.habitica_user_id && !!currentUser?.habitica_api_token;

  return (
    <nav
      className="w-full bg-blend-multiply border-b border-bark-light/40 px-8 py-4 flex justify-between items-center shadow-sm"
      style={cardBackgroundStyle}
    >
      <ul className="flex gap-6">
        {navItems.map((item) => {
          const isActive =
            item.href === "/lists"
              ? pathname.startsWith("/lists")
              : pathname === item.href;

          return (
            <li key={item.href}>
              {isActive ? (
                <LinkButton href={item.href}>{item.label}</LinkButton>
              ) : (
                <Link
                  href={item.href}
                  className="text-sm rounded-full px-3 py-1.5 transition-colors text-parchment/60 hover:bg-parchment/10 hover:text-parchment"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      {hasHabiticaCredentials && habiticaStats && (
        <div className="flex items-center gap-2 text-parchment">
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
