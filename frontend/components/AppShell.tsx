"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Library,
  Menu,
  Mic2,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const workspaceRef =
    useRef<HTMLDivElement>(null);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [workspaceOpen, setWorkspaceOpen] =
    useState(false);

  const userName =
    process.env.NEXT_PUBLIC_USER_NAME ||
    "Mehak Yadav";

  const userEmail =
    process.env.NEXT_PUBLIC_USER_EMAIL ||
    "mehak.yadav.ug23@nsut.ac.in";

  useEffect(() => {
    setMobileOpen(false);
    setWorkspaceOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(
          event.target as Node,
        )
      ) {
        setWorkspaceOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setWorkspaceOpen(false);
        setMobileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <div className="shell">
      {mobileOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen
            ? "is-mobile-open"
            : ""
        }`}
      >
        <div className="brand">
          <span className="brandmark">
            <Mic2 size={19} />
          </span>

          <span className="brand-name">
            MinuteFlow
          </span>

          <button
            type="button"
            className="mobile-close-button"
            aria-label="Close navigation"
            onClick={() =>
              setMobileOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="workspace-switcher"
          ref={workspaceRef}
        >
          <button
            type="button"
            className={`workspace ${
              workspaceOpen
                ? "is-open"
                : ""
            }`}
            aria-expanded={
              workspaceOpen
            }
            aria-haspopup="menu"
            onClick={() =>
              setWorkspaceOpen(
                (current) => !current,
              )
            }
          >
            <span>
              <Building2 size={15} />
              MY WORKSPACE
            </span>

            <ChevronDown
              size={15}
              className="workspace-arrow"
            />
          </button>

          {workspaceOpen && (
            <div
              className="workspace-dropdown"
              role="menu"
            >
              <button
                type="button"
                className="workspace-option active"
                role="menuitem"
                onClick={() =>
                  setWorkspaceOpen(false)
                }
              >
                <span className="workspace-option-icon">
                  <Building2 size={16} />
                </span>

                <span>
                  <b>My Workspace</b>
                  <small>
                    Your meeting library
                  </small>
                </span>

                <Check size={15} />
              </button>

              <button
                type="button"
                className="workspace-option"
                role="menuitem"
                disabled
              >
                <span className="workspace-option-icon">
                  <UserRound size={16} />
                </span>

                <span>
                  <b>
                    Personal Meetings
                  </b>
                  <small>
                    Coming soon
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="workspace-option"
                role="menuitem"
                disabled
              >
                <span className="workspace-option-icon">
                  <UsersRound size={16} />
                </span>

                <span>
                  <b>Shared with me</b>
                  <small>
                    Coming soon
                  </small>
                </span>
              </button>
            </div>
          )}
        </div>

        <nav>
          <Link
            className={
              pathname === "/"
                ? "active"
                : ""
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

          <div className="profile">
            <span className="avatar">
              MY
            </span>

            <div className="profile-copy">
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
            onClick={() =>
              setMobileOpen(true)
            }
          >
            <Menu size={21} />
          </button>

          <button
            type="button"
            className="global-search"
            aria-label="Search all meetings"
          >
            <Search size={17} />

            <span>
              Search all meetings
            </span>

            <kbd>Ctrl K</kbd>
          </button>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <i />
            </button>
          </div>
        </header>

        <div className="content">
          {children}
        </div>
      </main>
    </div>
  );
}