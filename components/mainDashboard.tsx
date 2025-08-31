"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { userApi } from "@/lib/api"
import { Users, UserCheck, MessageSquare, AlertTriangle, Bell } from "lucide-react"

export default function DashboardPage() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", 1],
    queryFn: () => userApi.getAllUsers(1, 20),
  })

  const stats = [
    {
      title: "Total Users",
      value: usersData?.data?.data?.pagination?.totalUsers || 0,
      icon: Users,
      change: "+ 36% from the last month",
      changeType: "positive" as const,
    },
    {
      title: "Online Users",
      value: "1,234",
      icon: UserCheck,
      change: "+ 36% from the last month",
      changeType: "positive" as const,
    },
    {
      title: "Active Chats",
      value: "1,234",
      icon: MessageSquare,
      change: "+ 36% from the last month",
      changeType: "positive" as const,
    },
    {
      title: "Reported Users",
      value: "1,234",
      icon: AlertTriangle,
      change: "+ 36% from the last month",
      changeType: "positive" as const,
    },
  ]

  const verifiedUsers = Math.floor((usersData?.data?.data?.pagination?.totalUsers || 0) * 0.6)
  const unverifiedUsers = (usersData?.data?.data?.pagination?.totalUsers || 0) - verifiedUsers

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live User Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live User Map</CardTitle>
            <p className="text-sm text-gray-600">
              View real-time locations of active users and monitor their availability status on the map.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* World Map Placeholder */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 1000 500" className="w-full h-full">
                  <path
                    d="M150,200 Q200,150 300,180 T500,200 Q600,220 700,200 T900,180"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="2,2"
                  />
                  <path
                    d="M100,300 Q200,250 400,280 T700,300 Q800,320 900,300"
                    stroke="#94a3b8"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="2,2"
                  />
                </svg>
              </div>

              {/* User Markers */}
              <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>

              {/* User Info Popup */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 bg-white rounded-lg shadow-lg p-3 border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Ursusus</p>
                    <p className="text-xs text-gray-500">100 Smith Street</p>
                    <p className="text-xs text-gray-500">Collingwood VIC 3066 AU</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <p className="text-sm text-gray-600">
              Track the number of users who have verified their email and those who haven't.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Donut Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray="60, 40"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm">Verified: {verifiedUsers}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm">Unverified: {unverifiedUsers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Verifications */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Pending Verifications</h4>
                <Button variant="link" className="text-blue-600 text-sm p-0 h-auto">
                  See all
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Olivia Rhye</p>
                      <p className="text-xs text-gray-500">example@example.com</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-600">
                      ✓
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Olivia Rhye</p>
                      <p className="text-xs text-gray-500">example@example.com</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-600">
                      ✓
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
