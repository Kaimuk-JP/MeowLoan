import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน | บริการรับทำงาน",
  description: "รีเซ็ตรหัสผ่านของคุณเพื่อเข้าสู่ระบบ",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">รีเซ็ตรหัสผ่าน</h1>
          <p className="mt-2 text-gray-600">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
