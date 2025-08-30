"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { reportsApi } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface Report {
  id: string
  reportType: string
  message: string
  attachments?: string[]
  status: string
  submittedBy: {
    name: string
    email: string
    avatar: string
  }
}

interface ReportDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
}

export function ReportDetailsModal({ open, onOpenChange, report }: ReportDetailsModalProps) {
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: (reportId: string) => reportsApi.resolveReport(reportId),
    onSuccess: () => {
      toast.success("Report resolved successfully!")
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to resolve report")
    },
  })

  const handleResolve = () => {
    if (report) {
      resolveMutation.mutate(report.id)
    }
  }

  if (!report) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Report Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">{report.reportType}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={report.message} readOnly className="min-h-[120px] resize-none bg-gray-50" />
          </div>

          {report.attachments && report.attachments.length > 0 && (
            <div className="space-y-2">
              <Label>Attachment</Label>
              <div className="flex gap-3">
                {report.attachments.slice(0, 3).map((attachment, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={`/attachment-.png?height=64&width=64&query=attachment-${index + 1}`}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolveMutation.isPending || report.status === "resolved"}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
            >
              {resolveMutation.isPending ? "Resolving..." : "Resolve"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
