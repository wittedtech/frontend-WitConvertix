import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Notification {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/auth/notifications", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Error in Fetch Notification UseEffect!"
        );
        toast.error(
          err instanceof Error
            ? err.message
            : "Error in Fetch Notification UseEffect!",
          { duration: 3000 }
        );
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No notifications available.
              </p>
            ) : (
              <ul className="space-y-4">
                {notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {notification.type}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
