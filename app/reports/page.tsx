"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Check, Trash2 } from "lucide-react"
import { reportApi } from "@/lib/api"
import { Pagination } from "@/components/pagination"
import { ReportDetailsModal } from "@/components/report-details-modal"

interface Report {
  _id: string
  name: string
  message: string
  attachment?: string[]
  reportBy: {
    _id: string
    email: string
    name: string
    avatar?: string
  }
  status: "pending" | "resolved"
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports", currentPage],
    queryFn: () => reportApi.getReports(currentPage, 20),
  })

  const reports = reportsData?.data?.data?.reports || []
  const pagination = reportsData?.data?.data?.pagination

  const filteredReports = reports.filter((report: Report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportBy.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || report.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport({
      ...report,
      reportType: report.name,
      submittedBy: {
        name: report.reportBy.name || report.reportBy.email.split("@")[0],
        email: report.reportBy.email,
        avatar: report.reportBy.avatar || `/placeholder.svg?height=32&width=32&query=user-avatar`,
      },
    })
    setShowDetailsModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600">Manage and resolve user submitted issues</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="grid grid-cols-7 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-700">
          <div>Reported ID</div>
          <div>Submitted By</div>
          <div>Description</div>
          <div>Problem Type</div>
          <div>Date</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 p-4 border-b">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))
          : filteredReports.map((report: Report) => (
              <div key={report._id} className="grid grid-cols-7 gap-4 p-4 border-b hover:bg-gray-50">
                <div className="text-blue-600 font-medium">#{report._id.slice(-4)}</div>

                <div className="flex items-center gap-2">
                  <img
                    src={report.reportBy.avatar || `/placeholder.svg?height=32&width=32&query=user-avatar`}
                    alt={report.reportBy.name || report.reportBy.email}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-sm">
                      {report.reportBy.name || report.reportBy.email.split("@")[0]}
                    </div>
                    <div className="text-xs text-gray-500">{report.reportBy.email}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 truncate">{report.message}</div>

                <Badge variant="destructive" className="w-fit">
                  {report.name}
                </Badge>

                <div className="text-sm text-gray-600">{formatDate(report.createdAt)}</div>

                <Badge
                  variant={report.status === "resolved" ? "default" : "secondary"}
                  className={
                    report.status === "resolved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {report.status === "resolved" ? "Solved" : "Pending"}
                </Badge>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewReport(report)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalReports}
            itemsPerPage={20}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Report Details Modal */}
      <ReportDetailsModal open={showDetailsModal} onOpenChange={setShowDetailsModal} report={selectedReport} />
    </div>
  )
}
