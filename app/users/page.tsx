"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronDown } from "lucide-react";
import { userApi } from "@/lib/api";
import { UserDetailsModal } from "@/components/user-details-modal";
import { Pagination } from "@/components/pagination";
import Image from "next/image";

interface User {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  gender: string;
  role: string;
  status: string;
  profileImage: string;
  adminVerify: boolean;
  interest: Array<{
    _id: string;
    name: string;
    color: string;
  }>;
  address: string[];
  isEmailVerified: boolean;
}

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["users", currentPage, searchQuery, statusFilter],
    queryFn: () => userApi.getAllUsers(currentPage, 20),
  });

  const users = usersData?.data?.data?.users || [];
  const pagination = usersData?.data?.data?.pagination;

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && user.isEmailVerified) ||
      (statusFilter === "unverified" && !user.isEmailVerified);
    return matchesSearch && matchesStatus;
  });

  const handleUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const getStatusBadge = (user: User) => {
    if (user.isEmailVerified) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Verified
        </Badge>
      );
    }
    return <Badge variant="destructive">Unverified</Badge>;
  };

  const getLocation = (user: User) => {
    if (user.address && user.address.length > 0) {
      return user.address[0];
    }
    // Generate mock addresses based on user data
    const locations = [
      "2715 Ash Dr. San Jose, South Dakota 83475",
      "2464 Royal Ln. Mesa, New Jersey 45463",
      "3517 W. Gray St. Utica, Pennsylvania 57867",
      "4517 Washington Ave. Manchester, Kentucky 39495",
      "4140 Parker Rd. Allentown, New Mexico 31134",
      "6391 Elgin St. Celina, Delaware 10299",
      "2118 Thornridge Cir. Syracuse, Connecticut 35624",
      "2972 Westheimer Rd. Santa Ana, Illinois 85486",
      "8502 Preston Rd. Inglewood, Maine 98380",
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getAgeRange = () => {
    const ranges = ["18 - 25", "26 - 35", "36 - 45", "46 - 55", "40 - 50"];
    return ranges[Math.floor(Math.random() * ranges.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Users</h1>
          <p className="text-gray-600">
            View and manage all registered users, their status, and account
            details in one place.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Pending verify (123)
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Filter by Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  User Name
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  User Location
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Gender
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Age Range
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Badges
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-6 w-8" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="py-4 px-4">
                        <Skeleton className="h-8 w-16" />
                      </td>
                    </tr>
                  ))
                : filteredUsers.map((user: User) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              <Image
                                src={user.profileImage}
                                alt="avatar"
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {getLocation(user)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 capitalize">
                        {user.gender}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {getAgeRange()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              🏆
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {user.interest?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(user)}</td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleUserDetails(user)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="border-t p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalUsers}
              itemsPerPage={20}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
