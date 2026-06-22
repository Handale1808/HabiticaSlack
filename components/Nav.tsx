// components/Nav.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { HabiticaClassIcon } from "@/components/HabiticaClassIcon";
import { HabiticaStatBars } from "@/components/HabiticaStatBars";
import { LinkButton } from "@/components/ui/LinkButton";
import { SpriteNineSlice } from "@/components/ui/SpriteNineSlice";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, authUser, habiticaStats } = useUser();

  const navItems = !authUser
    ? [{ href: "/login", label: "login" }]
    : !currentUser
      ? [{ href: "/profile", label: "profile" }]
      : [
          { href: "/upload", label: "upload" },
          { href: "/lists", label: "lists" },
          { href: "/profile", label: "profile" },
        ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const hasHabiticaCredentials =
    !!currentUser?.habitica_user_id && !!currentUser?.habitica_api_token;

  return (
    <div className="px-6 pt-4">
    <SpriteNineSlice sheetKey="medival" spriteId={20}>
      <nav className="bg-blend-multiply px-8 py-4 flex justify-between items-center shadow-sm">
        {" "}
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
        <div className="flex items-center gap-4">
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
          {currentUser && (
            <button
              onClick={handleSignOut}
              className="text-sm rounded-full px-3 py-1.5 transition-colors text-parchment/60 hover:bg-parchment/10 hover:text-parchment"
            >
              sign out
            </button>
          )}
        </div>
      </nav>
    </SpriteNineSlice>
    </div>
  );
}
