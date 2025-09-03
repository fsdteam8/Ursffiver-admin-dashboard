"use client";

import type React from "react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Award,
  Heart,
  FileText,
  LogOut,
  Menu,
  X,
  ChartBarStacked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// 📌 Navigation config
const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Badges", href: "/badges", icon: Award },
  { name: "Categories", href: "/categories", icon: ChartBarStacked },
  { name: "Interests", href: "/interests", icon: Heart },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// 📌 Fetch function for single user (with token)
const fetchSingleUser = async ({ queryKey }: { queryKey: [string, string, string] }) => {
  const [, userId, token] = queryKey;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/user/single-user/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.data;
};

// 📌 Change password request
const changePassword = async ({
  oldPassword,
  newPassword,
  token,
}: {
  oldPassword: string;
  newPassword: string;
  token: string;
}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Password change failed");
  }

  return res.json();
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const token = session?.accessToken;
  const userId = session?.user?.id;

  // 📌 Fetch user profile with TanStack Query
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["singleUser", userId as string, token as string],
    queryFn: fetchSingleUser,
    enabled: !!userId && !!token,
  });

  // 📌 Mutation for changing password
  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to change password");
    },
  });

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "rgba(236, 237, 253, 1)" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 mb-6 border-b">
            <div className="absolute top-6 left-8 flex flex-col items-center">
              <div className="text-3xl font-extrabold text-blue-600">SPEET</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-r-blue-600 border-transparent"></div>
                <div className="w-14 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-l-blue-600 border-transparent"></div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  {item.name}
                </Link>
              );
            })}

            <div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <LogOut size={20} />
                Log out
              </Button>
            </div>
          </nav>

          {/* ✅ User Profile clickable for Change Password */}
          <div
            className="p-4 border-t cursor-pointer hover:bg-gray-100"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                {userProfile?.profileImage ? (
                  <AvatarImage src={userProfile.profileImage} alt={userProfile.fullName} />
                ) : (
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {userProfile?.fullName?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isLoading ? "Loading..." : userProfile?.fullName || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">{userProfile?.role || "User"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="bg-[#3F42EE] text-white p-8"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>
        </header>
        <main className="p-6">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-md rounded-lg shadow-lg bg-white p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl font-semibold text-red-600">
              Are you sure you want to log out?
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-2">
              Logging out will end your current session. You'll need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLogoutModalOpen(false);
                handleSignOut();
              }}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md rounded-lg shadow-lg bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Change Password</DialogTitle>
            <DialogDescription>
              Enter your old and new password to update your account password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white"
              disabled={mutation.isLoading}
              onClick={() =>
                mutation.mutate({ oldPassword, newPassword, token: token as string })
              }
            >
              {mutation.isLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
