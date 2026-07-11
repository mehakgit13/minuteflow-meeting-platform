"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Library,
  Menu,
  Mic2,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const userName =
    process.env.NEXT_PUBLIC_USER_NAME || "Mehak Yadav";
  const userEmail =
    process.env.NEXT_PUBLIC_USER_EMAIL ||
    "mehak.yadav.ug23@nsut.ac.in";

  return (
    <div className="shell">
      {mobileOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="brand">
          <span className="brandmark">
            <Mic2 size={18} />
          </span>
          <span>MinuteFlow</span>
          <button
            type="button"
            className="mobile-close-button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <button type="button" className="workspace">
          MY WORKSPACE <ChevronDown size={14} />
        </button>

        <nav>
          <Link className={pathname === "/" ? "active" : ""} href="/">
            <Library size={18} />
            Meetings
          </Link>
          <span className="nav-disabled">
            <CalendarDays size={18} />
            Calendar <small>Soon</small>
          </span>
          <span className="nav-disabled">
            <Sparkles size={18} />
            AI Apps <small>Soon</small>
          </span>
        </nav>

        <div className="sidebar-bottom">
          <Link
            className={pathname === "/settings" ? "active" : ""}
            href="/settings"
          >
            <Settings size={18} />
            Settings
          </Link>
          <div className="profile">
            <span className="avatar">MY</span>
            <div>
              <b>{userName}</b>
              <small>{userEmail}</small>
            </div>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="global-search">
            <Search size={17} />
            <span>Search all meetings</span>
            <kbd>Ctrl K</kbd>
          </div>

          <button type="button" className="icon-btn" aria-label="Notifications">
            <Bell size={19} />
            <i />
          </button>
        </header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}
