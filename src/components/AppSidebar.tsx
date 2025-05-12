import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  FileTerminal,
  FolderDown,
  Info,
  Share2,
  Star,
  User,
  Bell,
  LogOut,
  MoreVertical,
  LogIn,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface User {
  email: string;
  username: string;
  name: string;
  avatar?: string;
}

const navItems = (isLoggedIn: boolean) => [
  { name: "Home", url: "/", icon: Home },
  {
    name: "File Upload",
    url: "/witconvertix/file-uploaded",
    icon: FileTerminal,
  },
  ...(isLoggedIn
    ? [{ name: "Converted Files", url: "/converted-files", icon: FolderDown }]
    : []),
  { name: "About Us", url: "/about-us", icon: Info },
  { name: "Social Links", url: "/social-links", icon: Share2 },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogin = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      setIsOpen(false);
      // Redirect to home if on a protected route
      const protectedRoutes = [
        "/profile",
        "/billing",
        "/notifications",
        "/converted-files",
      ];
      if (protectedRoutes.includes(location.pathname)) {
        toast.success("Logged out. Redirecting to Home Page.", {
          duration: 3000,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.", {
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text py-7 border-b border-black mb-15">
              {"WitConvertix"}
              <sub className="text-xs translate-y-[4px] ml-1 text-gray-600">
                © wittedtech
              </sub>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems(false).map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupContent className="mt-auto fixed bottom-5">
              <div className="flex items-center p-4 pl-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-1" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text py-7 border-b border-black mb-15">
            {"WitConvertix"}
            <sub className="text-xs translate-y-[4px] ml-1 text-gray-600">
              © wittedtech
            </sub>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems(!!user).map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent className="mt-auto fixed bottom-5">
            {user ? (
              <div className="flex items-center p-4 pl-2">
                <Avatar className="h-10 w-10 mr-1">
                  <AvatarImage
                    src={user.avatar || "https://via.placeholder.com/40"}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <button className="ml-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    <div className="p-4 flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={user.avatar || "https://via.placeholder.com/40"}
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {user.username}
                      </span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a
                            href="/upgrade"
                            className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          >
                            <Star className="mr-2 h-4 w-4" /> Upgrade to Pro
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/profile" className="flex items-center">
                            <User className="mr-2 h-4 w-4" /> Account
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/billing" className="flex items-center">
                            <Star className="mr-2 h-4 w-4" /> Billing
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a
                            href="/notifications"
                            className="flex items-center"
                          >
                            <Bell className="mr-2 h-4 w-4" /> Notifications
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                    <hr className="border-gray-200 dark:border-gray-700" />
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={handleLogout}
                          className="flex items-center w-full text-left"
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Log out
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="p-4 pl-2">
                <Button
                  onClick={handleLogin}
                  className="w-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
