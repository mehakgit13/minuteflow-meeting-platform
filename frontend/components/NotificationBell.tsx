"use client";

import {
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  ListTodo,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { NotificationItem } from "@/lib/types";

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "Meeting processed",
    description:
      "Q3 Product Strategy Review is ready to view.",
    time: "5 minutes ago",
    unread: true,
    meetingId: 1,
  },
  {
    id: 2,
    title: "Action item due soon",
    description:
      "Share revised onboarding prototype is due tomorrow.",
    time: "1 hour ago",
    unread: true,
    meetingId: 1,
  },
  {
    id: 3,
    title: "Transcript uploaded",
    description:
      "Weekly Engineering Sync was added successfully.",
    time: "Yesterday",
    unread: false,
    meetingId: 3,
  },
];

function notificationIcon(title: string) {
  if (title.toLowerCase().includes("processed")) {
    return <CheckCircle2 size={17} />;
  }

  if (title.toLowerCase().includes("action")) {
    return <ListTodo size={17} />;
  }

  return <FileText size={17} />;
}

export function NotificationBell() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(
    (notification) => notification.unread,
  ).length;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
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

  function markAllRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
  }

  function removeNotification(id: number) {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id,
      ),
    );
  }

  return (
    <div
      className="notification-wrapper"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="icon-btn notification-button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open notifications"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You are all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <Bell size={26} />
              <strong>No notifications</strong>
              <p>New updates will appear here.</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  className={`notification-item ${
                    notification.unread
                      ? "notification-unread"
                      : ""
                  }`}
                  key={notification.id}
                >
                  <div className="notification-item-icon">
                    {notificationIcon(
                      notification.title,
                    )}
                  </div>

                  <div className="notification-item-copy">
                    <strong>{notification.title}</strong>
                    <p>{notification.description}</p>
                    <span>
                      <Clock3 size={12} />
                      {notification.time}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="notification-remove"
                    aria-label="Remove notification"
                    onClick={() =>
                      removeNotification(notification.id)
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="notification-footer">
            Notifications are demo data for the
            assignment.
          </div>
        </div>
      )}
    </div>
  );
}