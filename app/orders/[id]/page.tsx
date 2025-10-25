"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrderById } from "@/lib/db-service"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, ArrowLeft, Edit, Download, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrder()
    }
  }, [user, params.id])

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
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปยังแดชบอร์ด
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

  const getOrderTypeText = (type: string) => {
    switch (type) {
      case "hourly":
        return "บริการรายชั่วโมง"
      case "package":
        return "แพ็คเกจ 36 ชั่วโมง"
      case "system":
        return "บริการกรอกข้อมูลลงระบบ"
      default:
        return type
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปยังแดชบอร์ด
              </Link>
            </Button>
          </div>

          <Card className="border-0 shadow-xl overflow-hidden">
            <div className={`h-2 ${order.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}></div>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">รายละเอียดคำสั่งซื้อ</CardTitle>
                  <p className="text-gray-500 mt-1">#{order.id}</p>
                </div>
                <Badge variant={order.status === "completed" ? "default" : "outline"} className="w-fit">
                  {order.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 text-lg">ข้อมูลการสั่งซื้อ</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ประเภท:</span>
                      <span className="font-medium">{getOrderTypeText(order.type)}</span>
                    </div>
                    {order.hours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">จำนวนชั่วโมง:</span>
                        <span className="font-medium">{order.hours} ชั่วโมง</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">กรอกข้อมูลลงระบบ:</span>
                      <span className="font-medium">{order.includeSystem ? "ใช่" : "ไม่ใช่"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ยอดชำระ:</span>
                      <span className="font-medium">{order.amount} บาท</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">วันที่สั่งซื้อ:</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">สถานะ:</span>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "default"
                            : order.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={order.status === "in_progress" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                      >
                        {order.status === "completed"
                          ? "เสร็จสิ้น"
                          : order.status === "in_progress"
                            ? "กำลังดำเนินการ"
                            : "รอดำเนินการ"}
                      </Badge>
                    </div>
                  </div>

                  {/* เพิ่มปุ่มแก้ไขข้อมูล */}
                  {order.status !== "completed" && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/orders/${order.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          แก้ไขข้อมูล
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* แสดงลิงก์ดาวน์โหลดเมื่อมี URL */}
                  {order.downloadUrl && (
                    <div className="mt-4">
                      <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          ดาวน์โหลดไฟล์งาน
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-lg">ข้อมูลส่วนตัว</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ชื่อ:</span>
                      <span className="font-medium">{order.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">เลขบัตรประชาชน:</span>
                      <span className="font-medium">{order.idNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">รหัสเข้ากยศคอนเน็ค:</span>
                      <span className="font-medium">{order.connectId}</span>
                    </div>
                    {order.studentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">รหัสนิสิต:</span>
                        <span className="font-medium">{order.studentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">เบอร์โทรศัพท์:</span>
                      <span className="font-medium">{order.phone}</span>
                    </div>
                    {order.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">หมายเหตุ:</span>
                        <span className="font-medium">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* แสดงส่วนดาวน์โหลดไฟล์งานเมื่อมี URL */}
              {order.downloadUrl && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">ไฟล์งาน</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">ไฟล์งานของคุณพร้อมให้ดาวน์โหลดแล้ว</p>
                        <p className="text-sm text-green-700 mt-1">คลิกที่ปุ่มด้านล่างเพื่อดาวน์โหลดไฟล์งาน</p>
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                        <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          เปิดลิงก์
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {order.paymentSlipUrl && order.status !== "completed" && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">สลิปการชำระเงิน</h3>
                  <div className="border rounded-md overflow-hidden bg-white">
                    <img
                      src={order.paymentSlipUrl || "/placeholder.svg"}
                      alt="Payment Slip"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>
              )}

              {order.status === "completed" && (
                <div>
                  <h3 className="font-medium mb-3 text-lg">ขอบคุณที่ใช้บริการ</h3>
                  <div className="border rounded-md overflow-hidden bg-white p-6 text-center">
                    <img src="/images/mochi-young-woman.png" alt="Thank You" className="w-48 h-auto mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-green-600 mb-2">คำสั่งซื้อนี้ได้ดำเนินการเสร็จสิ้นแล้ว </h4>
                    <p className="text-gray-600">ขอบคุณที่ใช้บริการของเรา หวังว่าจะได้ให้บริการคุณอีกในครั้งต่อไป</p>
                  </div>
                </div>
              )}

              {/* แก้ไขการแสดงข้อความแจ้งเตือนสำหรับสถานะ "in_progress" */}
              {order.status === "in_progress" && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTitle className="text-amber-800">คำสั่งซื้อกำลังดำเนินการ</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    คำสั่งซื้อนี้กำลังอยู่ในระหว่างดำเนินการ ทีมงานกำลังทำงานเพื่อให้บริการคุณ
                  </AlertDescription>
                </Alert>
              )}

              {order.status === "completed" && !order.downloadUrl && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">คำสั่งซื้อเสร็จสิ้น</AlertTitle>
                  <AlertDescription className="text-green-700">คำสั่งซื้อนี้ได้ดำเนินการเสร็จสิ้นแล้ว</AlertDescription>
                </Alert>
              )}

              {order.status === "completed" && order.downloadUrl && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">คำสั่งซื้อเสร็จสิ้น</AlertTitle>
                  <AlertDescription className="text-green-700">
                    คำสั่งซื้อนี้ได้ดำเนินการเสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการของเรา
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
