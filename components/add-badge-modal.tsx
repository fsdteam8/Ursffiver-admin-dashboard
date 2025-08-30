"use client"

import type React from "react"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { badgeApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddBadgeModalProps {
  isOpen: boolean
  onClose: () => void
}

const colorOptions = [
  { value: "blue", class: "bg-blue-500" },
  { value: "green", class: "bg-green-500" },
  { value: "red", class: "bg-red-500" },
  { value: "yellow", class: "bg-yellow-500" },
]

export function AddBadgeModal({ isOpen, onClose }: AddBadgeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    info: "",
    color: "blue",
  })
  const queryClient = useQueryClient()

  const createBadgeMutation = useMutation({
    mutationFn: badgeApi.createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] })
      toast.success("Badge created successfully!")
      handleClose()
    },
    onError: () => {
      toast.error("Failed to create badge. Please try again.")
    },
  })

  const handleClose = () => {
    setFormData({ name: "", tag: "", info: "", color: "blue" })
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.tag.trim() || !formData.info.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    createBadgeMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New Badge</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Badge Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Badge Name</Label>
            <Input
              id="name"
              placeholder="Great Listener"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Colour</Label>
            <div className="flex gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color.class,
                    formData.color === color.value ? "border-gray-800 scale-110" : "border-gray-300 hover:scale-105",
                  )}
                />
              ))}
            </div>
          </div>

          {/* Badge Tag */}
          <div className="space-y-2">
            <Label htmlFor="tag">Badge Tag</Label>
            <Input
              id="tag"
              placeholder="Communication"
              value={formData.tag}
              onChange={(e) => handleInputChange("tag", e.target.value)}
              required
            />
          </div>

          {/* Badge Info */}
          <div className="space-y-2">
            <Label htmlFor="info">Badge Info</Label>
            <Textarea
              id="info"
              placeholder="Communication"
              value={formData.info}
              onChange={(e) => handleInputChange("info", e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleClose}
              disabled={createBadgeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={createBadgeMutation.isPending}
            >
              {createBadgeMutation.isPending ? "Adding..." : "Add Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
