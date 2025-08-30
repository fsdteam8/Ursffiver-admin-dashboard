"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { interestsApi } from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface AddInterestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Array<{ id: string; name: string }>
}

const colors = [
  { name: "Blue", value: "blue", class: "bg-blue-600" },
  { name: "Green", value: "green", class: "bg-green-600" },
  { name: "Red", value: "red", class: "bg-red-600" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-600" },
]

export function AddInterestModal({ open, onOpenChange, categories }: AddInterestModalProps) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [selectedColor, setSelectedColor] = useState("blue")
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: { name: string; categoryId: string; color: string }) => interestsApi.createInterest(data),
    onSuccess: () => {
      toast.success("Interest created successfully!")
      queryClient.invalidateQueries({ queryKey: ["interests"] })
      onOpenChange(false)
      resetForm()
    },
    onError: () => {
      toast.error("Failed to create interest")
    },
  })

  const resetForm = () => {
    setName("")
    setCategoryId("")
    setSelectedColor("blue")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !categoryId) {
      toast.error("Please fill in all fields")
      return
    }
    createMutation.mutate({ name: name.trim(), categoryId, color: selectedColor })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add Interest</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="interest-name">Interest Name</Label>
            <Input
              id="interest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Animation"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Colour</Label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full ${color.class} ${
                    selectedColor === color.value ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interest Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Adventure" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? "Adding..." : "Add Badge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
