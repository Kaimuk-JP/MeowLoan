"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getAllPaymentSlips, uploadAdminPaymentSlip, deletePaymentSlip } from "@/lib/db-service"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
// เพิ่ม import สำหรับ Trash2 icon และ deletePaymentSlip
import { AlertCircle, Upload, Eye, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PaymentSlip {
  id: string
  imageUrl: string
  amount: number
  notes?: string
  orderId?: string
  createdAt: any
  uploadedByAdmin: boolean
}

export default function CreditsPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [paymentSlips, setPaymentSlips] = useState<PaymentSlip[]>([])
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const [canUpload, setCanUpload] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false) // Declare showLoginDialog

  // เพิ่ม state สำหรับการลบสลิป
  const [deletingSlipId, setDeletingSlipId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Upload form states
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    // ให้ทุกคนสามารถดูได้ แต่เฉพาะแอดมินเท่านั้นที่สามารถอัพโหลดได้
    if (!authLoading) {
      setIsAuthenticated(true)
      setShowLoginDialog(false)

      // ตรวจสอบสิทธิ์ในการอัพโหลด (เฉพาะแอดมิน)
      if (user && userProfile && userProfile.role === "admin") {
        setCanUpload(true)
      }
    }
  }, [user, userProfile, authLoading])

  useEffect(() => {
    const fetchPaymentSlips = async () => {
      try {
        setLoading(true)
        setError(null)

        const slips = await getAllPaymentSlips()
        setPaymentSlips(slips)
      } catch (error) {
        console.error("Error fetching payment slips:", error)
        setError("ไม่สามารถดึงข้อมูลสลิปการชำระเงินได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchPaymentSlips()
    }
  }, [isAuthenticated])

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

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("กรุณาเลือกไฟล์ภาพสลิป")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // ส่งข้อมูลไปยัง API โดยไม่ต้องส่งจำนวนเงินและหมายเหตุ
      const slipId = await uploadAdminPaymentSlip(file)

      // แสดงข้อความสำเร็จและรีเฟรชข้อมูล
      setSuccess("อัพโหลดสลิปการชำระเงินเรียบร้อยแล้ว")
      setShowUploadDialog(false)

      // Clear form
      setFile(null)
      setPreviewUrl(null)

      // Refresh payment slips
      const updatedSlips = await getAllPaymentSlips()
      setPaymentSlips(updatedSlips)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Error uploading payment slip:", error)
      setError("เกิดข้อผิดพลาดในการอัพโหลดสลิป กรุณาลองใหม่อีกครั้ง")
    } finally {
      setUploading(false)
    }
  }

  const viewSlipDetails = (slip: PaymentSlip) => {
    setSelectedSlip(slip)
  }

  const confirmDeleteSlip = (slipId: string) => {
    setDeletingSlipId(slipId)
    setShowDeleteDialog(true)
  }

  const handleDeleteSlip = async () => {
    if (!deletingSlipId) return

    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      await deletePaymentSlip(deletingSlipId)
      setPaymentSlips((prevSlips) => prevSlips.filter((slip) => slip.id !== deletingSlipId))
      setSuccess("ลบสลิปการชำระเงินเรียบร้อยแล้ว")
      setShowDeleteDialog(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Error deleting payment slip:", error)
      setError("เกิดข้อผิดพลาดในการลบสลิป กรุณาลองใหม่อีกครั้ง")
    } finally {
      setDeleting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">เครดิตและสลิปการชำระเงิน</CardTitle>
                <CardDescription className="text-blue-100">ดูตัวอย่างสลิปการชำระเงินที่ผ่านมา</CardDescription>
              </div>
              {canUpload && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    อัพโหลดสลิป
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ข้อผิดพลาด</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">สำเร็จ</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentSlips.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">ยังไม่มีสลิปการชำระเงิน</p>
                </div>
              ) : (
                paymentSlips.map((slip) => (
                  <Card key={slip.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 overflow-hidden bg-gray-100 relative">
                      <img
                        src={slip.imageUrl || "/placeholder.svg"}
                        alt="Payment Slip"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* แก้ไข CardContent ในส่วนของการแสดงสลิป เพิ่มปุ่มลบ */}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" onClick={() => viewSlipDetails(slip)}>
                          <Eye className="h-4 w-4 mr-1" />
                          ดูเต็มจอ
                        </Button>
                        {canUpload && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => confirmDeleteSlip(slip.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            ลบ
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog for uploading new slip */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>อัพโหลดสลิปการชำระเงิน</DialogTitle>
              <DialogDescription>อัพโหลดสลิปการชำระเงินที่ไม่เกี่ยวข้องกับคำสั่งซื้อ</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitUpload} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ข้อผิดพลาด</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="slip">สลิปการชำระเงิน</Label>
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
                          alt="สลิปการชำระเงิน"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-blue-600">คลิกเพื่อเปลี่ยนรูปภาพ</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-gray-700">คลิกเพื่ออัพโหลดสลิปการชำระเงิน</p>
                        <p className="text-xs text-gray-500">รองรับไฟล์ JPG, PNG</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={uploading || !file}>
                  {uploading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      กำลังอัพโหลด...
                    </>
                  ) : (
                    "อัพโหลด"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog for viewing slip details */}
        {selectedSlip && (
          <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>รายละเอียดสลิปการชำระเงิน</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="bg-white rounded-lg overflow-hidden border">
                  <img
                    src={selectedSlip.imageUrl || "/placeholder.svg"}
                    alt="Payment Slip"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setSelectedSlip(null)}>
                    ปิด
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {/* Dialog สำหรับยืนยันการลบสลิป */}
        <Dialog open={showDeleteDialog} onOpenChange={() => setShowDeleteDialog(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ยืนยันการลบสลิปการชำระเงิน</DialogTitle>
              <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบสลิปการชำระเงินนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                ยกเลิก
              </Button>
              <Button variant="destructive" onClick={handleDeleteSlip} disabled={deleting}>
                {deleting ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    กำลังลบ...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบสลิป
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}
