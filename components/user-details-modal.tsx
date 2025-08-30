"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, MapPin, Phone } from "lucide-react"

interface UserDetails {
  _id: string
  email: string
  fullName: string
  phone: string
  gender: string
  role: string
  status: string
  adminVerify: boolean
  interest: Array<{
    _id: string
    name: string
    color: string
  }>
  address: string[]
  isEmailVerified: boolean
}

interface UserDetailsModalProps {
  user: UserDetails | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

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

  const mockBadges = [
    { name: "Great Listener", category: "Communication", count: 123 },
    { name: "Knowledge Share", category: "Knowledge", count: 123 },
    { name: "Great Listener", category: "Communication", count: 123 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="sr-only">User Details</DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-4 top-4">
            <X size={20} />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">{user.fullName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                {user.isEmailVerified && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Passionate about tech, music, and deep conversations. Here to meet new people and explore meaningful
              connections. Always up for a good chat and fun!
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} />
              <span>{user.address.join(", ")}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="capitalize">{user.gender}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone size={16} />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>

          {/* Primary Interests */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Primary Interests</h4>
            <div className="flex flex-wrap gap-2">
              {user.interest?.map((interest) => (
                <Badge key={interest._id} className={getColorClass(interest.color)} variant="secondary">
                  {interest.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Earned Badges */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Earned Badges</h4>
            <div className="space-y-3">
              {mockBadges.map((badge, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{badge.name}</p>
                    <p className="text-xs text-gray-500">
                      Awarded to someone who was truly attentive and engaged during your conversation.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-600 font-medium">{badge.category}</p>
                    <p className="text-xs text-gray-500">🏆 {badge.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
