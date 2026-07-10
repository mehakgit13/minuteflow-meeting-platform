"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Library,
  LogOut,
  Mic2,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from "./NotificationBell";

const userName =
  process.env.NEXT_PUBLIC_USER_NAME || "Mehak Yadav";

const userEmail =
  process.env.NEXT_PUBLIC_USER_EMAIL ||
  "mehak.yadav.ug23@nsut.ac.in";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brandmark">
            <Mic2 size={18} />
          </span>
          <span>MinuteFlow</span>
        </Link>

        <button
          type="button"
          className="workspace"
        >
          <span>MY WORKSPACE</span>
          <ChevronDown size={14} />
        </button>

        <nav>
          <Link
            className={
              pathname === "/" ? "active" : ""
            }
            href="/"
          >
            <Library size={18} />
            Meetings
          </Link>

          <span className="nav-disabled">
            <CalendarDays size={18} />
            Calendar
            <small>Soon</small>
          </span>

          <span className="nav-disabled">
            <Sparkles size={18} />
            AI Apps
            <small>Soon</small>
          </span>
        </nav>

        <div className="sidebar-bottom">
          <Link
            className={
              pathname === "/settings"
                ? "active"
                : ""
            }
            href="/settings"
          >
            <Settings size={18} />
            Settings
          </Link>

          <div
            className="profile-wrapper"
            ref={profileRef}
          >
            <button
              type="button"
              className="profile"
              onClick={() =>
                setProfileOpen(
                  (current) => !current,
                )
              }
            >
              <span className="avatar">MY</span>

              <div>
                <b>{userName}</b>
                <small>{userEmail}</small>
              </div>

              <ChevronDown size={14} />
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-user">
                  <span className="avatar">MY</span>
                  <div>
                    <strong>{userName}</strong>
                    <span>{userEmail}</span>
                  </div>
                </div>

                <Link
                  href="/settings"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >
                  <UserRound size={16} />
                  Profile and settings
                </Link>

                <button
                  type="button"
                  disabled
                  title="Authentication is mocked"
                >
                  <LogOut size={16} />
                  Sign out
                  <small>Demo</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main>
       <header className="topbar">
  <GlobalSearch />

  <div className="topbar-actions">
    <ThemeToggle />
    <NotificationBell />
  </div>
</header>

        <div className="content">{children}</div>
      </main>
    </div>
  );
}