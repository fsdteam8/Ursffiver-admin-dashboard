"use client";

import type React from "react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Award,
  Heart,
  FileText,
  LogOut,
  Bell,
  Menu,
  X,
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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Badges", href: "/badges", icon: Award },
  { name: "Interests", href: "/interests", icon: Heart },
  { name: "Reports", href: "/reports", icon: FileText },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-600">SPEET</div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                <div className="w-6 h-0.5 bg-blue-600 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
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
            <div>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

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

          {/* User Profile */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {session?.user?.email?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {"Admin Name"}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header
          className="shadow-sm border-b"
          style={{ backgroundColor: "rgba(236, 237, 253, 1)" }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden bg-[#3F42EE] text-white p-8"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </Button>
              <div>
                <h1 className="bg-gradient-to-r from-[#3F42EE] to-[#8A8CF5] bg-clip-text text-transparent text-3xl font-bold">
                  Dashboard
                </h1>
                <p
                  className="text-[14px] font-normal"
                  style={{ color: "rgba(53, 53, 73, 1)" }}
                >
                  Welcome back! Here's what's happening with your app today.
                </p>
              </div>
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              className="relative bg-[#3F42EE] text-white p-2"
            >
              <Bell size={20} />
              Notification
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="max-w-md rounded-lg shadow-lg bg-white p-6">
          <DialogHeader className="text-center">
            <div className="mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <DialogTitle className="text-xl font-semibold text-red-600">
              Are you sure you want to log out?
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm mt-2">
              Logging out will end your current session. You'll need to sign in again to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-between">
            <Button
              variant="outline"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              onClick={() => {
                setIsLogoutModalOpen(false);
                handleSignOut();
              }}
            >
              <span className="mr-1">➔</span> Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}