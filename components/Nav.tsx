// components/Nav.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabaseClient";
import { LinkButton } from "@/components/ui/LinkButton";
import { SpriteNineSlice } from "@/components/ui/SpriteNineSlice";
import { AcornCount } from "@/components/AcornCount";
import { CustomStatBars } from "@/components/CustomStatBars";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, authUser, userStats } = useUser();

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
            {userStats && (
              <div className="flex items-center gap-3 text-parchment">
                <AcornCount acorns={userStats.acorns} />
                <CustomStatBars
                  wonder={userStats.wonder}
                  maxWonder={userStats.maxWonder}
                  magic={userStats.magic}
                  maxMagic={userStats.maxMagic}
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
