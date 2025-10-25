'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getExamById, type Exam } from '@/lib/exam-service'
import { useAuth } from '@/components/auth/auth-provider'
import { PageTransition } from '@/components/ui/page-transition'
import { BookOpen, Clock, FileQuestion, Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { notifyExamPurchase } from '@/lib/discord-service'
import Link from 'next/link'

export default function PurchaseExamPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนซื้อข้อสอบ')
      router.push('/login')
      return
    }
    loadExam()
  }, [user])

  const loadExam = async () => {
    try {
      setLoading(true)
      const examData = await getExamById(params.id as string)
      if (!examData) {
        toast.error('ไม่พบข้อมูลข้อสอบ')
        router.push('/exams')
        return
      }
      setExam(examData)
    } catch (error) {
      console.error('Error loading exam:', error)
      toast.error('ไม่สามารถโหลดข้อมูลข้อสอบได้')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์มีขนาดใหญ่เกิน 5MB')
        return
      }
      setPaymentSlip(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !exam) return
    
    if (!paymentSlip) {
      toast.error('กรุณาอัพโหลดสลิปการชำระเงิน')
      return
    }

    setSubmitting(true)
    try {
      // Upload payment slip to Cloudinary
      const paymentSlipUrl = await uploadToCloudinary(paymentSlip)

      // Create exam order in Firestore
      const orderData = {
        userId: user.uid,
        userEmail: user.email || '',
        examId: exam.id,
        examTitle: exam.title || exam.name || 'ไม่ระบุชื่อ',
        amount: exam.price || 0,
        status: 'pending' as const,
        paymentSlipUrl,
        purchaseDate: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'examOrders'), orderData)

      // ดึงชื่อลูกค้าจาก Firestore
      let customerName = user.displayName || user.email || 'ไม่ระบุชื่อ'
      try {
        const { doc, getDoc } = await import('firebase/firestore')
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          customerName = userData.displayName || userData.fullName || customerName
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }

      // ส่งแจ้งเตือนไปยัง Discord
      try {
        await notifyExamPurchase(
          exam.title || exam.name || 'ไม่ระบุชื่อ',
          customerName,
          exam.price || 0,
          paymentSlipUrl
        )
        console.log('Discord notification sent successfully')
      } catch (notificationError) {
        console.error('Failed to send Discord notification, but order was created successfully:', notificationError)
      }

      toast.success('สั่งซื้อข้อสอบสำเร็จ! กรุณารอการตรวจสอบการชำระเงิน')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-96 w-full max-w-4xl mx-auto" />
        </div>
      </PageTransition>
    )
  }

  if (!exam) {
    return null
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหน้าข้อสอบ
            </Link>
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Exam Details */}
              <Card className="overflow-hidden">
                {exam.imageUrl && (
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    <img src={exam.imageUrl} alt={exam.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {!exam.imageUrl && (
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-blue-500" />
                  </div>
                )}
                
                <CardHeader>
                  
                  <CardTitle className="text-2xl">{exam.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    
                    <div className="pt-3 border-t">
                      <div className="text-3xl font-bold text-blue-600">
                        ฿{exam.price}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>ชำระเงิน</CardTitle>
                  <CardDescription>
                    กรุณาโอนเงินและอัพโหลดสลิปการชำระเงิน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bank Details */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <h3 className="font-medium">ข้อมูลการโอนเงิน</h3>
                      <div className="text-sm space-y-1">
                        <p><strong>ธนาคาร:</strong> ธนาคารกรุงไทย (KTB)</p>
                        <p><strong>ชื่อบัญชี:</strong> นายไข่มุข จันทร์พริ้ม</p>
                        <p><strong>เลขที่บัญชี:</strong> 06-569-22937</p>
                        <p className="text-blue-600 font-medium">
                          <strong>ยอดที่ต้องชำระ:</strong> ฿{exam.price}
                        </p>
                      </div>
                    </div>

                    {/* Upload Payment Slip */}
                    <div className="space-y-2">
                      <Label htmlFor="payment-slip">อัพโหลดสลิปการชำระเงิน *</Label>
                      <Input
                        id="payment-slip"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                      {previewUrl && (
                        <div className="mt-4">
                          <img
                            src={previewUrl}
                            alt="Payment slip preview"
                            className="max-h-64 rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={submitting || !paymentSlip}
                    >
                      {submitting ? (
                        <>กำลังดำเนินการ...</>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          ยืนยันการสั่งซื้อ
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
