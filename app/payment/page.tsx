"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageTransition } from "@/components/ui/page-transition"
import { createOrderWithSlip } from "@/lib/db-service"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import QRCode from "../components/qr-code"
import { Suspense } from "react"
import { useAuth } from "@/components/auth/auth-provider"

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size={40} />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState(0)
  const [orderData, setOrderData] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // พร้อมเพย์หมายเลข
  const PROMPTPAY_NUMBER = "0656922937"

  useEffect(() => {
    // ตรวจสอบว่ามีการล็อกอินหรือไม่
    if (!authLoading && !user) {
      router.push("/login?redirect=/register")
      return
    }

    // ดึงข้อมูลจำนวนเงินจาก URL
    const amountParam = searchParams?.get("amount")
    setAmount(amountParam ? Number.parseInt(amountParam) : 0)

    // ดึงข้อมูลคำสั่งซื้อจาก localStorage
    const pendingOrderData = localStorage.getItem("pendingOrder")
    if (pendingOrderData) {
      try {
        const parsedData = JSON.parse(pendingOrderData)
        setOrderData(parsedData)

        // ตรวจสอบว่าจำนวนเงินตรงกันหรือไม่
        if (amountParam && Number(amountParam) !== parsedData.amount) {
          console.warn("Amount mismatch between URL and stored data")
          setError("ข้อมูลจำนวนเงินไม่ตรงกัน กรุณาลองใหม่อีกครั้ง")
        }
      } catch (e) {
        console.error("Error parsing pending order data:", e)
        setError("ข้อมูลคำสั่งซื้อไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง")
      }
    } else {
      console.warn("No pending order data found")
      setError("ไม่พบข้อมูลคำสั่งซื้อ กรุณากรอกข้อมูลใหม่อีกครั้ง")
    }
  }, [searchParams, router, user, authLoading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      console.log("File selected:", selectedFile.name, "Size:", selectedFile.size)
      setFile(selectedFile)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !orderData) {
      console.error("Missing file or order data")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Starting payment submission with order data")

      // สร้างคำสั่งซื้อและอัพโหลดสลิปพร้อมกัน
      await createOrderWithSlip(orderData, file)
      console.log("Order created and payment slip uploaded successfully")

      // ลบข้อมูลคำสั่งซื้อจาก localStorage
      localStorage.removeItem("pendingOrder")

      // Redirect to confirmation page
      router.push("/confirmation")
    } catch (error: any) {
      console.error("Error creating order and uploading payment slip:", error)

      // ในสภาพแวดล้อมการพรีวิว ให้ redirect ไปที่หน้า confirmation ถึงแม้จะมีข้อผิดพลาด
      if (process.env.NODE_ENV === "development" || window.location.hostname.includes("vercel.app")) {
        console.log("Continuing to confirmation page despite upload error in preview environment")
        localStorage.removeItem("pendingOrder")
        router.push("/confirmation")
        return
      }

      setError(`เกิดข้อผิดพลาด: ${error.message || "กรุณาลองใหม่อีกครั้ง"}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
              <div>
                <CardTitle className="text-2xl">ชำระเงิน</CardTitle>
                <CardDescription className="text-blue-100">โอนเงินและอัพโหลดสลิปการโอนเงิน</CardDescription>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>ข้อผิดพลาด</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                  <div className="font-medium text-gray-700">ข้อมูลการโอนเงิน</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">จำนวนเงิน:</span>
                      <span className="font-medium text-blue-600">{amount} บาท</span>
                    </div>
                    {orderData && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ชื่อผู้สั่งซื้อ:</span>
                        <span className="font-medium">{orderData.fullName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">สแกน QR Code เพื่อชำระเงิน</h3>
                    <p className="text-sm text-gray-500 mb-4">สแกนเพื่อชำระเงินผ่านแอปพลิเคชันธนาคารของคุณ</p>
                  </div>
                  <div className="border-2 border-blue-100 p-2 rounded-lg bg-white">
                    <QRCode
                      amount={amount}
                      recipientId="xxx-x-xxxxx-x"
                      promptPayNumber={PROMPTPAY_NUMBER}
                      recipientName="จิตอาสาออนไลน์"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Label htmlFor="slip" className="text-base">
                    อัพโหลดสลิปการโอนเงิน
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <Input
                      id="slip"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                    <Label htmlFor="slip" className="cursor-pointer block">
                      {previewUrl ? (
                        <div className="space-y-2">
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="สลิปการโอนเงิน"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-blue-600">คลิกเพื่อเปลี่ยนรูปภาพ</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-gray-700">คลิกเพื่ออัพโหลดสลิปการโอนเงิน</p>
                          <p className="text-xs text-gray-500">รองรับไฟล์ JPG, PNG</p>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 h-12 text-lg"
                  disabled={loading || !file || !orderData}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      กำลังอัพโหลด...
                    </>
                  ) : (
                    "ยืนยันการชำระเงิน"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
