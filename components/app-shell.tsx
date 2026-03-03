"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SideNav } from "@/components/ui/SideNav";

const titleMap: Array<{ match: (path: string) => boolean; label: string }> = [
  { match: (path) => path === "/", label: "Dashboard" },
  { match: (path) => path.startsWith("/cases/new"), label: "New Case Wizard" },
  { match: (path) => path === "/cases", label: "My Cases" },
  { match: (path) => path.startsWith("/cases/"), label: "Case Detail" },
  { match: (path) => path.startsWith("/templates"), label: "Templates Library" },
  { match: (path) => path.startsWith("/practice"), label: "Practice Mode" },
  { match: (path) => path.startsWith("/settings"), label: "Settings" }
];

function getTitle(pathname: string): string {
  return titleMap.find((entry) => entry.match(pathname))?.label ?? "ResolvePath";
}

export function AppShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1720px]">
        <SideNav />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Link href="/" className="lg:hidden">
                  <Image src="/logo.jpeg" alt="ResolvePath" width={145} height={32} priority />
                </Link>
                <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text)]">{getTitle(pathname)}</h1>
              </div>

              <div className="flex items-center gap-3">
                <p className="hidden text-xs text-[var(--color-text-muted)] md:block">Calm authority drafting interface</p>
                <Link href="/cases/new">
                  <Button>Start New Case</Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <footer className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-text-muted)] sm:px-6 lg:px-8">
            InnoWeb Ventures Ltd
          </footer>
        </div>
      </div>
    </div>
  );
}
