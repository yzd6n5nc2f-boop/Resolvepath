"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  FolderKanban,
  LibraryBig,
  MessageSquareText,
  Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cases/new", label: "Start New Case", icon: Sparkles },
  { href: "/cases", label: "My Cases", icon: FolderKanban },
  { href: "/templates", label: "Templates", icon: LibraryBig },
  { href: "/practice", label: "Practice", icon: MessageSquareText },
  { href: "/settings", label: "Settings", icon: Settings2 }
];

export function SideNav(): JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[272px] flex-col border-r border-brand-navy/10 bg-white/90 px-5 py-6 backdrop-blur lg:flex">
      <div className="px-2">
        <Image src="/resolvepath-logo.svg" alt="ResolvePath" width={170} height={40} priority />
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-brand-navy text-white shadow-soft"
                  : "text-black hover:bg-brand-gray/65"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-brand-cloud p-4 text-xs text-brand-ink">
        <Chip variant="warning" className="mb-2">
          Guidance
        </Chip>
        Drafts support a fair process and communication quality. Final judgement remains with your internal policy and reviewers.
      </div>
    </aside>
  );
}
