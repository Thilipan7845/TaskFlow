import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

import { supabase } from "../lib/supabase";

function NotificationCenter() {
  const [notifications, setNotifications] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        if (isMounted) {
          setLoading(true);
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (
          userError ||
          !user
        ) {
          if (isMounted) {
            setNotifications([]);
            setLoading(false);
          }

          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from("notifications")
          .select("*")
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(30);

        if (error) {
          console.error(
            "Failed to load notifications:",
            error
          );

          if (isMounted) {
            setLoading(false);
          }

          return;
        }

        if (isMounted) {
          setNotifications(
            data || []
          );

          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Notification loading failed:",
          error
        );

        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    // =========================================
    // REALTIME NOTIFICATIONS
    // =========================================

    const channel =
      supabase
        .channel(
          "taskflow-notifications"
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
          },
          async (payload) => {
            if (!isMounted) {
              return;
            }

            // Only add notifications
            // belonging to the current user.
            const {
              data: { user },
            } =
              await supabase.auth.getUser();

            if (
              !user ||
              payload.new.user_id !==
                user.id
            ) {
              return;
            }

            setNotifications(
              (current) => {
                const alreadyExists =
                  current.some(
                    (item) =>
                      item.id ===
                      payload.new.id
                  );

                if (
                  alreadyExists
                ) {
                  return current;
                }

                return [
                  payload.new,
                  ...current,
                ];
              }
            );
          }
        )
        .subscribe();

    return () => {
      isMounted = false;

      supabase.removeChannel(
        channel
      );
    };
  }, []);

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.is_read
    ).length;

  // =========================================
  // MARK READ
  // =========================================

  async function markRead(
    notificationId
  ) {
    const {
      error,
    } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq(
        "id",
        notificationId
      );

    if (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            notificationId
              ? {
                  ...item,
                  is_read: true,
                }
              : item
        )
    );
  }

  // =========================================
  // MARK ALL READ
  // =========================================

  async function markAllRead() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq(
          "user_id",
          user.id
        );

      if (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error
        );

        return;
      }

      setNotifications(
        (current) =>
          current.map(
            (item) => ({
              ...item,
              is_read: true,
            })
          )
      );
    } catch (error) {
      console.error(
        "Mark all read failed:",
        error
      );
    }
  }

  // =========================================
  // DELETE NOTIFICATION
  // =========================================

  async function deleteNotification(
    notificationId
  ) {
    try {
      const {
        error,
      } = await supabase
        .from("notifications")
        .delete()
        .eq(
          "id",
          notificationId
        );

      if (error) {
        console.error(
          "Failed to delete notification:",
          error
        );

        return;
      }

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              notificationId
          )
      );
    } catch (error) {
      console.error(
        "Delete notification failed:",
        error
      );
    }
  }

  // =========================================
  // GET NOTIFICATION ICON
  // =========================================

  function getIcon(type) {
    if (
      type ===
      "overdue"
    ) {
      return (
        <AlertTriangle
          size={18}
        />
      );
    }

    if (
      type ===
      "deadline"
    ) {
      return (
        <CalendarDays
          size={18}
        />
      );
    }

    return (
      <Clock
        size={18}
      />
    );
  }

  // =========================================
  // FORMAT TIME
  // =========================================

  function formatTime(date) {
    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "";
    }

    return value.toLocaleString(
      [],
      {
        dateStyle:
          "medium",
        timeStyle:
          "short",
      }
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="notification-wrapper">

      {/* NOTIFICATION BUTTON */}

      <button
        type="button"
        className="notification-button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* NOTIFICATION PANEL */}

      {open && (
        <div className="notification-panel">

          {/* HEADER */}

          <div className="notification-header">

            <div>
              <strong>
                Notifications
              </strong>

              <span>
                {unreadCount} unread
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllRead
                }
              >
                <CheckCheck
                  size={15}
                />

                Mark all read
              </button>
            )}

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="notification-empty">

              <Clock
                size={24}
              />

              <span>
                Loading notifications...
              </span>

            </div>

          ) : notifications.length ===
            0 ? (

            /* EMPTY */

            <div className="notification-empty">

              <Bell
                size={24}
              />

              <span>
                You're all caught up.
              </span>

            </div>

          ) : (

            /* LIST */

            <div className="notification-list">

              {notifications.map(
                (item) => (
                  <div
                    key={
                      item.id
                    }
                    className={`notification-item ${
                      item.is_read
                        ? ""
                        : "notification-unread"
                    }`}
                    onClick={() =>
                      markRead(
                        item.id
                      )
                    }
                  >

                    {/* ICON */}

                    <div className="notification-icon">
                      {getIcon(
                        item.type
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="notification-content">

                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.message}
                      </p>

                      <span>
                        {formatTime(
                          item.created_at
                        )}
                      </span>

                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      className="notification-delete"
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        deleteNotification(
                          item.id
                        );
                      }}
                      aria-label="Delete notification"
                    >
                      <Trash2
                        size={15}
                      />
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default NotificationCenter;