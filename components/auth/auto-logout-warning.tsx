"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "./auth-provider"
import { logout } from "@/lib/auth-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

// เวลาที่จะแสดงการแจ้งเตือนก่อนล็อกเอาท์อัตโนมัติ (5 นาที = 5 * 60 * 1000 มิลลิวินาที)
const WARNING_TIME = 5 * 60 * 1000
// เวลาทั้งหมดก่อนล็อกเอาท์อัตโนมัติ (1 ชั่วโมง = 60 * 60 * 1000 มิลลิวินาที)
const AUTO_LOGOUT_TIME = 60 * 60 * 1000

export function AutoLogoutWarning() {
  const { user } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      setShowWarning(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      return
    }

    const checkSessionTime = () => {
      const lastActiveTime = localStorage.getItem("lastActiveTime")
      if (lastActiveTime) {
        const currentTime = Date.now()
        const timeDiff = currentTime - Number.parseInt(lastActiveTime)
        const timeRemaining = AUTO_LOGOUT_TIME - timeDiff

        if (timeRemaining <= WARNING_TIME && timeRemaining > 0) {
          setShowWarning(true)
          setRemainingTime(Math.floor(timeRemaining / 1000))
        } else {
          setShowWarning(false)
        }
      }
    }

    // ตรวจสอบทุก 1 วินาที
    timerRef.current = setInterval(checkSessionTime, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [user])

  const handleStayLoggedIn = () => {
    // อัปเดตเวลาล่าสุดเพื่อรีเซ็ตตัวนับเวลา
    localStorage.setItem("lastActiveTime", Date.now().toString())
    setShowWarning(false)
  }

  const handleLogout = () => {
    logout()
  }

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>แจ้งเตือนการออกจากระบบอัตโนมัติ</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            คุณจะถูกออกจากระบบอัตโนมัติในอีก {Math.floor(remainingTime / 60)} นาที {remainingTime % 60} วินาที
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleStayLoggedIn}>
              ยังคงอยู่ในระบบ
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              ออกจากระบบ
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
