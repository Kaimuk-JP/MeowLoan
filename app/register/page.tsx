"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageTransition } from "@/components/ui/page-transition"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth/auth-provider"
import { Suspense } from "react"

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size={40} />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [formType, setFormType] = useState(searchParams?.get("type") || "hourly")
  const [includeSystem, setIncludeSystem] = useState(false)
  const [hours, setHours] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<{
    idNumber?: string
    phone?: string
    hours?: string
  }>({})

  // Form fields
  const [fullName, setFullName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [connectId, setConnectId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  // เพิ่ม state สำหรับเก็บรูปภาพที่อัพโหลด
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/register?type=${formType}`)}`)
    }
  }, [user, authLoading, router, formType,])

  // แก้ไข useEffect ให้ดึงข้อมูลจาก Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          // ดึงข้อมูลจาก Firestore users collection
          const { doc, getDoc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')

          const userDoc = await getDoc(doc(db, 'users', user.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // ตั้งค่าข้อมูลหากมีใน database
            if (userData.displayName && !fullName) {
              setFullName(userData.displayName)
            }
            if (userData.idNumber && !idNumber) {
              setIdNumber(userData.idNumber)
            }
            if (userData.studentId && !studentId) {
              setStudentId(userData.studentId)
            }
            if (userData.phone && !phone) {
              setPhone(userData.phone)
            }
          } else {
            // ถ้าไม่มีข้อมูลใน Firestore ใช้จาก Auth
            if (user.displayName && !fullName) {
              setFullName(user.displayName)
            }
          }
        } catch (error) {
          console.error("Error loading user profile:", error)
          if (user.displayName && !fullName) {
            setFullName(user.displayName)
          }
        }
      }
    }

    loadUserProfile()
  }, [user])

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

  // Validate hours
  const validateHours = (value: string) => {
    if (value.length === 0 || Number(value) < 1 || Number(value) > 70) {
      setValidationErrors((prev) => ({ ...prev, hours: "จำนวนชั่วโมงต้องอยู่ระหว่าง 1 ถึง 70" }))
      return false
    }

    setValidationErrors((prev) => ({ ...prev, hours: undefined }))
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    // Validate form
    const isIdNumberValid = validateIdNumber(idNumber)
    const isPhoneValid = validatePhone(phone)
    const isHoursValid = formType === "hourly" ? validateHours(hours) : true

    if (!isIdNumberValid || !isPhoneValid || !isHoursValid) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // สร้างข้อมูลคำสั่งซื้อ
     const orderData: any = {
  userId: user.uid,
  fullName,
  idNumber,
  connectId: (includeSystem || formType === "system" || formType === "package" || formType === "hourly") ? connectId : null, // เก็บค่าสำหรับทุกประเภทบริการ
  studentId: (includeSystem || formType === "system") ? studentId : null, // เก็บค่าเมื่อติ๊กหรือเลือก system เท่านั้น
  phone,
  notes: notes || null,
  type: formType as "hourly" | "package" | "system",
  hours: formType === "package" ? 36 : formType === "hourly" ? Number(hours) : 0,
  includeSystem: includeSystem,
  amount: calculatePrice(),
}

      // บันทึกข้อมูลคำสั่งซื้อลงใน localStorage
      localStorage.setItem("pendingOrder", JSON.stringify(orderData))
      console.log("Order data saved to localStorage:", orderData)

      // ไปยังหน้าชำระเงิน
      router.push(`/payment?amount=${calculatePrice()}`)
    } catch (error) {
      console.error("Error preparing order data:", error)
      setError("เกิดข้อผิดพลาดในการเตรียมข้อมูล กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  // Calculate price based on selection
  const calculatePrice = () => {
    let price = 0

    if (formType === "hourly") {
      // คำนวณราคา 8 บาทต่อชั่วโมง
      const hoursNum = Number(hours)
      price = hoursNum * 8
    } else if (formType === "package") {
      price = 150
    } else if (formType === "system") {
      price = 100
    }

    if (includeSystem && (formType === "hourly" || formType === "package")) {
      price += 100
    }

    return price
  }

  useEffect(() => {
    const type = searchParams?.get("type")
    if (type) {
      setFormType(type)
    }
  }, [searchParams])

  // เพิ่ม useEffect เพื่อทำความสะอาด URL ตัวอย่างเมื่อคอมโพเนนต์ถูกทำลาย
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

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
      <div className="container mx-auto px-4 py-12 bg-blue-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-blue-600 text-white">
              <div>
                <CardTitle className="text-2xl">ลงทะเบียนบริการ</CardTitle>
                <CardDescription className="text-blue-100">กรอกข้อมูลเพื่อลงทะเบียนใช้บริการ</CardDescription>
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

                <div className="space-y-2">
                  <Label className="text-base">เลือกประเภทบริการ</Label>
                  <RadioGroup defaultValue={formType} onValueChange={setFormType} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="flex-1 cursor-pointer">
                        <div className="font-medium">บริการเก็บชั่วโมงรายชั่วโมง</div>
                        <div className="text-sm text-gray-500">
                          ฿8
                          <div className="mt-1">
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2  p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <RadioGroupItem value="package" id="package" />
                      <Label htmlFor="package" className="flex-1 cursor-pointer">
                        <div className="font-medium">แพ็คเกจ 36 ชั่วโมง</div>
                        <div className="text-sm text-gray-500">150 บาท </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="flex-1 cursor-pointer">
                        <div className="font-medium">บริการกรอกข้อมูลลงระบบ</div>
                        <div className="text-sm text-gray-500">100 บาท</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formType === "hourly" && (
                  <div className="space-y-2">
                    <Label htmlFor="hours">จำนวนชั่วโมง</Label>
                    <Input
                      id="hours"
                      name="hours"
                      type="number"
                      min="1"
                      max="36"
                      value={hours}
                      onChange={(e) => {
                        setHours(e.target.value)
                        validateHours(e.target.value)
                      }}
                      className="focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {validationErrors.hours && <p className="text-sm text-red-500 mt-1">{validationErrors.hours}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      ราคา: {hours ? Number(hours) * 8 : 0} บาท
                    </p>
                  </div>
                )}

                {(formType === "hourly" || formType === "package") && (
                  <div className="space-y-4">
                    <div className="text-base font-medium">คุณต้องการเพิ่มบริการกรอกข้อมูลเข้าระบบกยศมอหรือไม่?</div>
                    <div className="flex items-center space-x-2 p-4 rounded-lg bg-blue-50">
                      <Checkbox
                        id="includeSystem"
                        checked={includeSystem}
                        onCheckedChange={(checked) => setIncludeSystem(checked as boolean)}
                      />
                      <Label htmlFor="includeSystem" className="cursor-pointer">
                        <div className="font-medium">เพิ่มบริการกรอกข้อมูลลงระบบ</div>
                        <div className="text-sm text-gray-500">เพิ่ม 100 บาท</div>
                      </Label>
                    </div>
                  </div>
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

                  {(includeSystem || formType === "system" || formType === "package" || formType === "hourly") && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="connectId">รหัสผ่านกยศ connect </Label>
                        <Input
                          id="connectId"
                          name="connectId"
                          value={connectId}
                          onChange={(e) => setConnectId(e.target.value)}
                          className="focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {(includeSystem || formType === "system") && (
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
                    </>
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

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium text-gray-700">ยอดชำระทั้งหมด</div>
                  <div className="text-3xl font-bold text-blue-600">{calculatePrice()} บาท</div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  disabled={
                    loading || !!validationErrors.idNumber || !!validationErrors.phone || !!validationErrors.hours
                  }
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    "ดำเนินการต่อ"
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
