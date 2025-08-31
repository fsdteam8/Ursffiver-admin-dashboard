"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { interestApi } from "@/lib/api"
import { AddInterestModal } from "@/components/add-interest-modal"

interface Interest {
  _id: string
  name: string
  color: string
  interestCategory: string
  createdAt: string
  updatedAt: string
}

interface Category {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
}

export default function InterestsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["interest-categories"],
    queryFn: interestApi.getCategories,
  })

  const { data: interestsData, isLoading: interestsLoading } = useQuery({
    queryKey: ["interests"],
    queryFn: interestApi.getInterests,
  })

  const categories = categoriesData?.data?.data || []
  const interests = interestsData?.data?.data || []

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: "bg-yellow-100 border-yellow-200",
      green: "bg-green-100 border-green-200",
      blue: "bg-blue-100 border-blue-200",
      red: "bg-red-100 border-red-200",
      purple: "bg-purple-100 border-purple-200",
      orange: "bg-orange-100 border-orange-200",
    }
    return colorMap[color] || "bg-gray-100 border-gray-200"
  }

  const getInterestsByCategory = (categoryId: string) => {
    return interests.filter((interest: Interest) => interest.interestCategory === categoryId)
  }

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#3F42EE] to-[#8A8CF5] bg-clip-text text-transparent">Interests</h1>
          <p className="text-[#353549] text-14 font-normal">
            Explore and manage user-selected interests to enhance personalized connections.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Interests
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interests
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoriesLoading || interestsLoading
          ? // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          : categories.map((category: Category) => {
              const categoryInterests = getInterestsByCategory(category._id)
              return (
                <div key={category._id} className="space-y-4 border border-[#F2F4F7] rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 text-lg border-b pb-2 p-4">{category.name}</h3>
                  <div className="space-y-3 p-4">
                    {categoryInterests.length > 0 ? (
                      categoryInterests.map((interest: Interest) => (
                        <div
                          key={interest._id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${getColorClass(interest.color)}`}
                        >
                          <label
                            htmlFor={interest._id}
                            className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                          >
                            {interest.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No interests yet.</p>
                    )}
                  </div>
                </div>
              )
            })}
      </div>

      {/* Empty State */}
      {!categoriesLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interest categories yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first interest category.</p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interest
          </Button>
        </div>
      )}

      {/* Add Interest Modal */}
      <AddInterestModal open={showAddModal} onOpenChange={setShowAddModal} categories={categories} />
    </div>
  )
}
