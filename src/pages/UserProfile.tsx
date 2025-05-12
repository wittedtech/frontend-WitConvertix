import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "react-toastify";

interface ConversionData {
  fileFormat: string;
  count: number;
}

export default function UserProfile() {
  const [user, setUser] = React.useState<{
    username: string;
    avatar: string;
  } | null>(null);
  const [conversions, setConversions] = React.useState<ConversionData[]>([]);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser({ username: data.username, avatar: data.avatar });
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch user");
      }
    };

    const fetchConversions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/files/converted`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch conversions");
        const files = await response.json();
        const formatCounts: { [key: string]: number } = {};
        files.forEach((file: { name: string }) => {
          const format = file.name.split(".").pop()?.toLowerCase() || "unknown";
          formatCounts[format] = (formatCounts[format] || 0) + 1;
        });
        const data = Object.entries(formatCounts).map(
          ([fileFormat, count]) => ({
            fileFormat,
            count,
          })
        );
        setConversions(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch conversions");
      }
    };

    fetchUser();
    fetchConversions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {user && (
                <>
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{user.username}</h2>
                </>
              )}
              <div className="w-full mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  Conversion Activity
                </h3>
                {conversions.length > 0 ? (
                  <BarChart width={500} height={300} data={conversions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fileFormat" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    No conversions yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
