"use client"

import type React from "react"

import { useState } from "react"
import { X, Star, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface ReviewHeaderProps {
  title?: string
  subtitle?: string
  className?: string
  variant?: "default" | "dark" | "gradient" | "primary"
  icon?: React.ReactNode
  actionText?: string
  actionUrl?: string
  dismissable?: boolean
  onClose?: () => void
}

export function ReviewHeader({
  title = "ReviewHub",
  subtitle = "แชร์ประสบการณ์ดีๆ",
  className,
  variant = "default",
  icon = <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />,
  actionText = "เริ่มรีวิว",
  actionUrl = "#",
  dismissable = true,
  onClose,
}: ReviewHeaderProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  if (!isVisible) return null

  const variantClasses = {
    default: "bg-gray-800 text-white",
    dark: "bg-black text-white",
    gradient: "bg-gradient-to-r from-gray-800 to-gray-700 text-white",
    primary: "bg-gradient-to-r from-blue-600 to-teal-500 text-white",
  }

  return (
    <div
      className={cn("relative flex items-center justify-between px-4 py-3 text-sm", variantClasses[variant], className)}
    >
      <div className="flex items-center">
        {icon}
        <div className="ml-2">
          <div className="font-medium">{title}</div>
          <div className="text-xs opacity-80">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center">
        {actionText && actionUrl && (
          <Link href={actionUrl} className="flex items-center text-xs font-medium hover:underline mr-4">
            {actionText}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Link>
        )}
        {dismissable && (
          <button
            onClick={handleClose}
            className="rounded-full p-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
