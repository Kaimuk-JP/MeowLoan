"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrderById, updateOrder } from "@/lib/db-service"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  // Form fields
  const [fullName, setFullName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [connectId, setConnectId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [validationErrors, setValidationErrors] = useState<{
    idNumber?: string
    phone?: string
  }>({})

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) return

      try {
        setLoading(true)
        const orderData = await getOrderById(params.id)

        if (!orderData) {
          setError("ไม่พบข้อมูลคำสั่งซื้อ")
          return
        }

        // Check if the order belongs to the current user
        if (orderData.userId !== user.uid) {
          setError("คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้")
          return
        }

        // Check if the order is already completed
        if (orderData.status === "completed") {
          setError("ไม่สามารถแก้ไขคำสั่งซื้อที่ดำ���นินการเสร็จสิ้นแล้ว")
          return
        }

        setOrder(orderData)

        // Set form values
        setFullName(orderData.fullName || "")
        setIdNumber(orderData.idNumber || "")
        setConnectId(orderData.connectId || "")
        setStudentId(orderData.studentId || "")
        setPhone(orderData.phone || "")
        setNotes(orderData.notes || "")
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุ���าลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrder()
    }
  }, [user, params.id])

  // Validate ID number
  const validateIdNumber = (value: string) => {
    if (value.length !== 13) {
      setValidationErrors((prev) => ({ ...prev, idNumber: "เลขบัตรประชาชนต้องมี 13 หลัก" }))
      return false
    }

    // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
    if (!/^\d+$/.test(value)) {
      setValidationErrors((prev) => ({ ...prev, idNumber: "เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น" }))
      return false
    }

    setValidationErrors((prev) => ({ ...prev, idNumber: undefined }))
    return true
  }

  // Validate phone number
  const validatePhone = (value: string) => {
    if (value.length !== 10) {
      setValidationErrors((prev) => ({ ...prev, phone: "เบอร์โทรศัพท์ต้องมี 10 หลัก" }))
      return false
    }

    // ตรวจสอบว่าเป็นตัวเลขทั้งหมด
    if (!/^\d+$/.test(value)) {
      setValidationErrors((prev) => ({ ...prev, phone: "เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น" }))
      return false
    }

    setValidationErrors((prev) => ({ ...prev, phone: undefined }))
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const isIdNumberValid = validateIdNumber(idNumber)
    const isPhoneValid = validatePhone(phone)

    if (!isIdNumberValid || !isPhoneValid) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Update order data
      const updatedData = {
        fullName,
        idNumber,
        connectId,
        studentId: studentId || null,
        phone,
        notes: notes || null,
      }

      await updateOrder(params.id, updatedData)
      setSuccess("บันทึกข้อมูลเรียบร้อยแล้ว")

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/orders/${params.id}`)
      }, 2000)
    } catch (error) {
      console.error("Error updating order:", error)
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (error) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ข้อผิดพลาด</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" asChild>
              <Link href={`/orders/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปยังรายละเอียดคำสั่งซื้อ
              </Link>
            </Button>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!order) {
    return null
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href={`/orders/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปยังรายละเอียดคำสั่งซื้อ
              </Link>
            </Button>
          </div>

          <Card className="border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">แก้ไขข้อมูลคำสั่งซื้อ</CardTitle>
                  <CardDescription className="text-blue-100">#{params.id}</CardDescription>
                </div>
                <div className="w-16 h-16 relative">
                  <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
                    <span className="text-white font-bold text-xl">จอ</span>
                  </div>
                </div>
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

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">สำเร็จ</AlertTitle>
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">เลขบัตรประชาชน</Label>
                    <Input
                      id="idNumber"
                      name="idNumber"
                      value={idNumber}
                      onChange={(e) => {
                        setIdNumber(e.target.value)
                        validateIdNumber(e.target.value)
                      }}
                      className={`focus:ring-2 focus:ring-blue-500 ${validationErrors.idNumber ? "border-red-500" : ""}`}
                      required
                      maxLength={13}
                    />
                    {validationErrors.idNumber && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.idNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="connectId">รหัสเข้ากยศคอนเน็ค</Label>
                    <Input
                      id="connectId"
                      name="connectId"
                      value={connectId}
                      onChange={(e) => setConnectId(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {(order.includeSystem || order.type === "system") && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">รหัสนิสิต</Label>
                      <Input
                        id="studentId"
                        name="studentId"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        validatePhone(e.target.value)
                      }}
                      className={`focus:ring-2 focus:ring-blue-500 ${validationErrors.phone ? "border-red-500" : ""}`}
                      required
                      maxLength={10}
                    />
                    {validationErrors.phone && <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 h-12 text-lg"
                  disabled={saving || !!validationErrors.idNumber || !!validationErrors.phone}
                >
                  {saving ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      บันทึกข้อมูล
                    </>
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
