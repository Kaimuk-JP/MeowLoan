"use client"

import type React from "react"

import { useState } from "react"
import { X, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewBannerProps {
  title?: string
  className?: string
  variant?: "default" | "dark" | "gradient"
  icon?: React.ReactNode
  onClose?: () => void
}

export function ReviewBanner({
  title = "ReviewHub - แชร์ประสบการณ์ดีๆ",
  className,
  variant = "default",
  icon = <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />,
  onClose,
}: ReviewBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "relative flex items-center justify-between px-4 py-2 text-sm font-medium text-white",
        variant === "default" && "bg-gray-800",
        variant === "dark" && "bg-black",
        variant === "gradient" && "bg-gradient-to-r from-gray-800 to-gray-700",
        className,
      )}
    >
      <div className="flex items-center">
        {icon}
        <span>{title}</span>
      </div>
      <button
        onClick={handleClose}
        className="ml-2 rounded-full p-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
        aria-label="ปิด"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
