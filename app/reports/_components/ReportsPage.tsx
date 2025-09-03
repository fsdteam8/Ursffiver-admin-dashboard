"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Check, Trash2 } from "lucide-react";
import { reportApi } from "@/lib/api";
import { Pagination } from "@/components/pagination";
import { ReportDetailsModal } from "@/components/report-details-modal";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type for the reportBy object
interface ReportBy {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// Type for the Report object
interface Report {
  _id: string;
  name: string;
  message: string;
  attachment?: string | string[];
  reportBy: ReportBy;
  status?: "pending" | "resolved";
  createdAt: string;
  updatedAt: string;
}

// Type for the normalized Report object (after normalization)
interface NormalizedReport extends Report {
  status: "pending" | "resolved";
  attachment: string[];
  reportBy: {
    _id: string;
    email: string;
    name: string;
    avatar: string;
    attachment: string;
  };
}

// Type for the API response
interface ReportsApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    reports: Report[];
    pagination: {
      totalReports: number;
      currentPage: number;
      totalPages: number; // Fixed typo from 'totalPages Headlines'
      pageSize: number;
    };
  };
}

// Type for API error
interface ApiError {
  message: string;
  status?: number;
}

// Type for the ReportDetailsModal report prop
interface ModalReport extends NormalizedReport {
  reportType: string;
  submittedBy: {
    name: string;
    email: string;
    avatar: string;
  };
}

// Type for Pagination component props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Type for reportApi methods
interface ReportApi {
  getReports: (page: number, pageSize: number) => Promise<ReportsApiResponse>;
  updateReportStatus: (reportId: string, status: "resolved") => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
}

// Adapter functions to match ReportApi interface
const reportApiAdapter: ReportApi = {
  getReports: async (page: number, pageSize: number) => {
    const res = await reportApi.getReports(page, pageSize);
    // If AxiosResponse, use .data
    return res.data ?? res;
  },
  updateReportStatus: async (reportId: string, status: "resolved") => {
    // Assuming reportApi.resolveReport exists and resolves the report
    await reportApi.resolveReport(reportId);
  },
  deleteReport: async (reportId: string) => {
    await reportApi.deleteReport(reportId);
  },
};

export default function ReportsPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "resolved"
  >("all");
  const [selectedReport, setSelectedReport] = useState<ModalReport | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const {
    data: reportsData,
    isLoading,
    isError,
    error,
  } = useQuery<ReportsApiResponse, ApiError>({
    queryKey: ["reports", currentPage],
    queryFn: () => reportApiAdapter.getReports(currentPage, 20),
  });

  const resolveReportMutation = useMutation<void, ApiError, string>({
    mutationFn: (reportId: string) =>
      reportApiAdapter.updateReportStatus(reportId, "resolved"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", currentPage] });
    },
  });

  const deleteReportMutation = useMutation<void, ApiError, string>({
    mutationFn: (reportId: string) => reportApiAdapter.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", currentPage] });
    },
  });

  const reports = useMemo(
    () => reportsData?.data?.reports ?? [],
    [reportsData]
  );
  const pagination = reportsData?.data?.pagination;

  const normalizedReports = useMemo((): NormalizedReport[] => {
    return reports.map((report) => ({
      ...report,
      status: report.status ?? "pending",
      attachment: Array.isArray(report.attachment)
        ? report.attachment
        : report.attachment
        ? [report.attachment]
        : [],
      reportBy: {
        ...report.reportBy,
        name: report.reportBy.name ?? report.reportBy.email.split("@")[0],
        avatar:
          report.reportBy.avatar ??
          "/placeholder.svg?height=32&width=32&query=user-avatar",
      },
    }));
  }, [reports]);

  const filteredReports = useMemo(() => {
    return normalizedReports.filter((report) => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportBy.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedReports, searchQuery, statusFilter]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewReport = (report: NormalizedReport) => {
    setSelectedReport({
      ...report,
      reportType: report.name,
      submittedBy: {
        name: report.reportBy.name,
        email: report.reportBy.email,
        avatar: report.reportBy.attachment,
      },
    });
    setShowDetailsModal(true);
  };

  const handleResolveReport = (reportId: string) => {
    resolveReportMutation.mutate(reportId);
  };

  const handleDeleteReport = (reportId: string) => {
    deleteReportMutation.mutate(reportId);
  };

  if (isError) {
    return (
      <div className="text-red-600">
        Error fetching reports:{" "}
        {error?.message ?? "An unexpected error occurred"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-600">
            Manage and resolve user submitted issues
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "pending" | "resolved") =>
            setStatusFilter(value)
          }
        >
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
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Reported ID</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: pagination?.pageSize ?? 8 }).map(
                  (_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
              : filteredReports.map((report) => (
                  <TableRow key={report._id} className="hover:bg-gray-50">
                    <TableCell className="text-blue-600 font-medium">
                      #{report._id.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Image
                          src={report.reportBy.avatar}
                          width={32}
                          height={32}
                          alt={report.reportBy.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {report.reportBy.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {report.reportBy.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 truncate">
                      {report.message}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "resolved" ? "default" : "secondary"
                        }
                        className={
                          report.status === "resolved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {report.status === "resolved" ? "Solved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {report.attachment.length ? (
                        <a
                          href={report.attachment[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Attachment
                        </a>
                      ) : (
                        "No Attachment"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewReport(report)}
                          aria-label={`View report ${report._id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolveReport(report._id)}
                          disabled={resolveReportMutation.isLoading}
                          aria-label={`Resolve report ${report._id}`}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDeleteReport(report._id)}
                          disabled={deleteReportMutation.isLoading}
                          aria-label={`Delete report ${report._id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
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
      <ReportDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        report={selectedReport}
      />
    </div>
  );
}
