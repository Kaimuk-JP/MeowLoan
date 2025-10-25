"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ReviewNotificationProps {
  title?: string
  message?: string
  className?: string
  variant?: "default" | "dark" | "gradient" | "success" | "info"
  icon?: React.ReactNode
  duration?: number | null // null means it won't auto-close
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
  onClose?: () => void
}

export function ReviewNotification({
  title = "ReviewHub",
  message = "แชร์ประสบการณ์ดีๆ",
  className,
  variant = "default",
  icon = <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />,
  duration = 5000,
  position = "top-right",
  onClose,
}: ReviewNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (duration !== null && isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) onClose()
      }, duration)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [duration, isVisible, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  }

  const variantClasses = {
    default: "bg-gray-800 text-white",
    dark: "bg-black text-white",
    gradient: "bg-gradient-to-r from-gray-800 to-gray-700 text-white",
    success: "bg-gradient-to-r from-green-600 to-teal-500 text-white",
    info: "bg-gradient-to-r from-blue-600 to-indigo-500 text-white",
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn("fixed z-50", positionClasses[position])}
          initial={{ opacity: 0, y: position.includes("top") ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position.includes("top") ? -20 : 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn("rounded-lg shadow-lg overflow-hidden w-72 md:w-80", variantClasses[variant], className)}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="flex items-center space-x-2">
                {icon}
                <span className="font-medium">{title}</span>
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm">{message}</p>
            </div>
            {duration !== null && (
              <div className="h-1 bg-white/10">
                <div
                  className="h-full bg-white/30"
                  style={{
                    width: "100%",
                    animation: `shrink ${duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Add the animation keyframes to the global style
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes shrink {
      from { width: 100%; }
      to { width: 0%; }
    }
  `
  document.head.appendChild(style)
}
