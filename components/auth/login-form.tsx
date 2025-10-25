"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  // ใช้ค่าเริ่มต้นเป็น "/dashboard" ในกรณีที่ searchParams ยังไม่พร้อมใช้งาน
  const redirectTo = searchParams?.get("redirect") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Attempting to sign in user:", email)

      // Sign in user and retrieve profile from database
      await signIn(email, password)

      console.log("Login successful, redirecting to:", redirectTo)
      router.push(redirectTo)
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle different Firebase auth errors
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential" ||
        error.code === "auth/invalid-email"
      ) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else if (error.code === "auth/too-many-requests") {
        setError("มีการพยายามเข้าสู่ระบบหลายครั้งเกินไป โปรดลองอีกครั้งในภายหลัง")
      } else {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
        <CardDescription className="text-blue-100">เข้าสู่ระบบเพื่อใช้บริการและตรวจสอบสถานะงาน</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ข้อผิดพลาด</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 h-12 text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>
          <div className="text-center text-sm">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register/account" className="text-blue-600 hover:underline">
              สมัครสมาชิก
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
