"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { Confetti } from "@/components/ui/confetti"
import { useEffect } from "react"

export default function ConfirmationPage() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageTransition>
      <Confetti />
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-green-400 to-teal-500"></div>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">การสั่งซื้อเสร็จสมบูรณ์</CardTitle>
              <CardDescription className="text-base">ขอบคุณสำหรับการใช้บริการของเรา</CardDescription>
            </CardHeader>
            <CardContent className="text-center px-8">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100 mb-6">
                <p className="text-green-800">เราได้รับข้อมูลการสั่งซื้อและการชำระเงินของคุณแล้ว</p>
              </div>
              <p className="mb-4">ทีมงานจะดำเนินการตามที่คุณร้องขอโดยเร็วที่สุด</p>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4 text-left">
                <p className="text-blue-800 font-medium mb-2">📋 ตรวจสอบคำสั่งซื้อของคุณ</p>
                <p className="text-sm text-blue-700 mb-2">
                  กรุณาตรวจสอบคำสั่งซื้อของคุณที่{" "}
                  <Link href="/dashboard" className="font-medium underline hover:text-blue-900">
                    หน้าแดชบอร์ด
                  </Link>
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4 text-left">
                <p className="text-amber-800 font-medium mb-2">⚠️ หากคำสั่งซื้อไม่ปรากฏ</p>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li>ลองเปิดในเบราว์เซอร์ Chrome, Firefox หรือ Safari</li>
                  <li>กรอกข้อมูลและสั่งซื้อใหม่อีกครั้ง</li>
                  <li>หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม</li>
                  <li>กรุณาติดต่อเราผ่านทาง Line: MinOru21</li>

                </ul>
              </div>


            </CardContent>
            <CardFooter className="flex flex-col gap-3 bg-gray-50 px-6 py-4">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                asChild
              >
                <Link href="/dashboard">ตรวจสอบคำสั่งซื้อ</Link>
              </Button>
              <Button
                className="w-full"
                variant="outline"
                asChild
              >
                <Link href="/">กลับสู่หน้าหลัก</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
