"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trash2, Plus } from "lucide-react"
import { badgeApi } from "@/lib/api"
import { AddBadgeModal } from "@/components/add-badge-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { toast } from "sonner"

interface BadgeItem {
  _id: string
  name: string
  tag: string
  info: string
  color: string
  createdAt: string
  updatedAt: string
}

export default function BadgesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: badgesData, isLoading } = useQuery({
    queryKey: ["badges", currentPage],
    queryFn: () => badgeApi.getBadges(currentPage, 20),
  })

  const deleteBadgesMutation = useMutation({
    mutationFn: async (badgeIds: string[]) => {
      await Promise.all(badgeIds.map((id) => badgeApi.deleteBadge(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] })
      toast.success("Badges deleted successfully!")
      setSelectedBadges([])
      setIsDeleteModalOpen(false)
    },
    onError: () => {
      toast.error("Failed to delete badges. Please try again.")
    },
  })

  const badges = badgesData?.data?.data?.badges || []

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: "bg-yellow-100 text-yellow-800",
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
    }
    return colorMap[color] || "bg-gray-100 text-gray-800"
  }

  const handleSelectBadge = (badgeId: string) => {
    setSelectedBadges((prev) => (prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]))
  }

  const handleDeleteSelected = () => {
    if (selectedBadges.length === 0) {
      toast.error("Please select badges to delete")
      return
    }
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    deleteBadgesMutation.mutate(selectedBadges)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#3F42EE] to-[#8A8CF5] bg-clip-text text-transparent">Badges</h1>
          <p className="text-[#353549] text-14 font-normal">
            Assign and manage achievement badges to recognize user activity and engagement.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
            onClick={handleDeleteSelected}
            disabled={selectedBadges.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Badges
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Badge
          </Button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          : badges.map((badge: BadgeItem) => (
              <Card
                key={badge._id}
                className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                  selectedBadges.includes(badge._id) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => handleSelectBadge(badge._id)}
              >
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                    <Badge className={getColorClass(badge.color)} variant="secondary">
                      {badge.tag}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{badge.info}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && badges.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first achievement badge.</p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Badge
          </Button>
        </div>
      )}

      {/* Add Badge Modal */}
      <AddBadgeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Badges"
        description={`Are you sure you want to delete ${selectedBadges.length} badge${selectedBadges.length > 1 ? "s" : ""}? This action cannot be undone.`}
        isLoading={deleteBadgesMutation.isPending}
      />
    </div>
  )
}
