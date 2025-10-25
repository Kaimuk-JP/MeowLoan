"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { onAuthChange, getUserProfile, logout, type UserProfile } from "@/lib/auth-service"
import type { User } from "firebase/auth"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshUserProfile: async () => {},
})

// ค่าคงที่สำหรับเวลาที่ต้องการให้ล็อกเอาท์อัตโนมัติ (1 ชั่วโมง = 60 * 60 * 1000 มิลลิวินาที)
const AUTO_LOGOUT_TIME = 60 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const autoLogoutTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Function to refresh user profile data
  const refreshUserProfile = async () => {
    if (user) {
      try {
        console.log("Refreshing user profile for:", user.uid)
        const profile = await getUserProfile(user.uid)
        if (profile) {
          console.log("User profile refreshed successfully:", profile)
          setUserProfile(profile)
        } else {
          console.warn("No user profile found during refresh")
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error)
      }
    }
  }

  // ฟังก์ชันสำหรับตั้งค่าเวลาล็อกอินล่าสุด
  const updateLastActiveTime = () => {
    if (user) {
      localStorage.setItem("lastActiveTime", Date.now().toString())
    }
  }

  // ฟังก์ชันสำหรับตรวจสอบเวลาและล็อกเอาท์อัตโนมัติ
  const checkAutoLogout = () => {
    if (user) {
      const lastActiveTime = localStorage.getItem("lastActiveTime")
      if (lastActiveTime) {
        const currentTime = Date.now()
        const timeDiff = currentTime - Number.parseInt(lastActiveTime)

        if (timeDiff >= AUTO_LOGOUT_TIME) {
          console.log("Auto logout: User inactive for more than 1 hour")
          logout()
        }
      }
    }
  }

  // ตั้งค่าตัวจับเวลาสำหรับการล็อกเอาท์อัตโนมัติ
  useEffect(() => {
    if (user) {
      // บันทึกเวลาล็อกอินล่าสุดเมื่อผู้ใช้ล็อกอิน
      updateLastActiveTime()

      // ตั้งค่าตัวจับเวลาเพื่อตรวจสอบทุก 1 นาที
      autoLogoutTimerRef.current = setInterval(() => {
        checkAutoLogout()
      }, 60 * 1000)

      // ตั้งค่า event listeners เพื่ออัปเดตเวลาล่าสุดเมื่อผู้ใช้มีการโต้ตอบกับหน้าเว็บ
      window.addEventListener("click", updateLastActiveTime)
      window.addEventListener("keypress", updateLastActiveTime)
      window.addEventListener("scroll", updateLastActiveTime)
      window.addEventListener("mousemove", updateLastActiveTime)

      return () => {
        if (autoLogoutTimerRef.current) {
          clearInterval(autoLogoutTimerRef.current)
        }
        window.removeEventListener("click", updateLastActiveTime)
        window.removeEventListener("keypress", updateLastActiveTime)
        window.removeEventListener("scroll", updateLastActiveTime)
        window.removeEventListener("mousemove", updateLastActiveTime)
      }
    } else {
      // ล้างตัวจับเวลาเมื่อผู้ใช้ล็อกเอาท์
      if (autoLogoutTimerRef.current) {
        clearInterval(autoLogoutTimerRef.current)
      }
      localStorage.removeItem("lastActiveTime")
    }
  }, [user])

  useEffect(() => {
    console.log("Auth provider initializing")

    // Set up auth state change listener
    console.log("Setting up auth state change listener")
    const unsubscribe = onAuthChange(async (authUser) => {
      console.log("Auth state changed:", authUser ? `User: ${authUser.uid}` : "No user")
      setUser(authUser)

      if (authUser) {
        try {
          console.log("Fetching user profile for:", authUser.uid)
          const profile = await getUserProfile(authUser.uid)
          if (profile) {
            console.log("User profile fetched successfully:", profile)
            setUserProfile(profile)
          } else {
            console.warn("No user profile found in database")
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => {
      console.log("Cleaning up auth state change listener")
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshUserProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
