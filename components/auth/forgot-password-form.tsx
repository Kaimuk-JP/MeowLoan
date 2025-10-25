"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendPasswordResetEmail } from "@/lib/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("Attempting to send password reset email to:", email)
      await sendPasswordResetEmail(email)
      setSuccess(true)
      // ไม่ต้อง redirect เพื่อให้ผู้ใช้เห็นข้อความสำเร็จ
    } catch (error: any) {
      console.error("Password reset error:", error)

      // Handle different Firebase auth errors
      if (error.code === "auth/invalid-email") {
        setError("รูปแบบอีเมลไม่ถูกต้อง")
      } else if (error.code === "auth/user-not-found") {
        // For security reasons, we don't want to reveal if an email exists or not
        // So we'll show success message even if the email doesn't exist
        setSuccess(true)
      } else {
        setError("เกิดข้อผิดพลาดในการส่งอีเมลรีเซ็ตรหัสผ่าน โปรดลองอีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
        <CardTitle className="text-2xl">ลืมรหัสผ่าน</CardTitle>
        <CardDescription className="text-blue-100">กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</CardDescription>
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

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">ส่งอีเมลสำเร็จ</AlertTitle>
              <AlertDescription className="text-green-600">
                เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (อย่าลืมตรวจสอบโฟลเดอร์สแปมด้วย)
              </AlertDescription>
            </Alert>
          )}

          {!success && (
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500"
                required
                placeholder="กรอกอีเมลที่ใช้ลงทะเบียน"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!success ? (
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 h-12 text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  กำลังส่งอีเมล...
                </>
              ) : (
                "ส่งลิงก์รีเซ็ตรหัสผ่าน"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-600 h-12 text-lg"
              onClick={() => router.push("/login")}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          )}
          <div className="text-center text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
