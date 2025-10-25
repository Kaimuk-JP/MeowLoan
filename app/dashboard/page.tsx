"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { getOrdersByUserId } from "@/lib/db-service"
import { getUserExams } from "@/lib/exam-service"
import { PageTransition } from "@/components/ui/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderCard } from "@/components/dashboard/order-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, Plus, BookOpen, CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// แก้ไขฟังก์ชัน DashboardPage เพื่อรองรับสถานะ "in_progress"
export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [examOrders, setExamOrders] = useState<any[]>([])
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
    const fetchOrders = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError(null)

        console.log("Fetching orders for user:", user.uid)
        const userOrders = await getOrdersByUserId(user.uid)
        console.log("Orders fetched successfully:", userOrders.length)
        setOrders(userOrders)

        // Fetch exam orders
        const userExamOrders = await getUserExams(user.uid)
        console.log("Exam orders fetched successfully:", userExamOrders.length)
        setExamOrders(userExamOrders)
      } catch (error: any) {
        console.error("Error fetching orders:", error)

        // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับ index หรือไม่
        if (error.message && error.message.includes("requires an index")) {
          setError("ระบบกำลังเตรียมข้อมูลสำหรับการแสดงผลครั้งแรก กรุณาลองใหม่อีกครั้งในอีกสักครู่")
        } else {
          setError("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

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

  // เพิ่มการกรองสำหรับสถานะ "in_progress"
  const pendingOrders = orders.filter((order) => order.status === "pending")
  const inProgressOrders = orders.filter((order) => order.status === "in_progress")
  const completedOrders = orders.filter((order) => order.status === "completed")

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">แดชบอร์ด</h1>
              <p className="text-gray-600">ยินดีต้อนรับ, {userProfile?.displayName || user.email}</p>
            </div>
            <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/register?type=hourly">
                <Plus className="h-4 w-4 mr-2" />
                สั่งซื้อบริการใหม่
              </Link>
            </Button>
          </div>

          {/* แก้ไขการแสดงจำนวนคำสั่งซื้อในแต่ละสถานะ */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">คำสั่งซื้อทั้งหมด</CardTitle>
                <CardDescription>จำนวนคำสั่งซื้อทั้งหมดของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">รอดำเนินการ</CardTitle>
                <CardDescription>คำสั่งซื้อที่รอดำเนินการ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">กำลังดำเนินการ</CardTitle>
                <CardDescription>คำสั่งซื้อที่กำลังดำเนินการ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{inProgressOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">เสร็จสิ้น</CardTitle>
                <CardDescription>คำสั่งซื้อที่ดำเนินการเสร็จสิ้น</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedOrders.length}</div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>ข้อผิดพลาด</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" className="mb-8">
            {/* แก้ไข TabsList เพื่อเพิ่มแท็บสำหรับสถานะ "in_progress" */}
            <TabsList className="mb-4 bg-gray-100">
              <TabsTrigger value="all">บริการจิตอาสา</TabsTrigger>
              <TabsTrigger value="exams">ข้อสอบที่ซื้อ</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={30} />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">คุณยังไม่มีคำสั่งซื้อบริการจิตอาสา</p>
                  <Button asChild>
                    <Link href="/register?type=hourly">สั่งซื้อบริการ</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* รอดำเนินการ */}
                  {pendingOrders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-gray-800">รอดำเนินการ</h3>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          {pendingOrders.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingOrders.map((order) => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* กำลังดำเนินการ */}
                  {inProgressOrders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <LoadingSpinner size={20} className="text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-800">กำลังดำเนินการ</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {inProgressOrders.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inProgressOrders.map((order) => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* เสร็จสิ้น */}
                  {completedOrders.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-800">เสร็จสิ้น</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {completedOrders.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedOrders.map((order) => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="exams">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={30} />
                </div>
              ) : examOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">คุณยังไม่มีข้อสอบที่ซื้อ</p>
                  <Button asChild>
                    <Link href="/exams">ดูข้อสอบทั้งหมด</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examOrders.map((examOrder) => (
                    <Card key={examOrder.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                      <div
                        className={`h-2 ${
                          examOrder.status === "completed"
                            ? "bg-green-500"
                            : examOrder.status === "paid"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                        }`}
                      ></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <BookOpen className="h-8 w-8 text-blue-500" />
                          <Badge
                            className={
                              examOrder.status === "completed"
                                ? "bg-green-500 hover:bg-green-600"
                                : examOrder.status === "paid"
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : "bg-amber-500 hover:bg-amber-600"
                            }
                          >
                            {examOrder.status === "completed"
                              ? "เสร็จสิ้น"
                              : examOrder.status === "paid"
                                ? "ชำระเงินแล้ว"
                                : "รอตรวจสอบ"}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{examOrder.examTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">ยอดชำระ:</span>
                            <span className="font-medium">฿{examOrder.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">วันที่สั่งซื้อ:</span>
                            <span className="font-medium">
                              {examOrder.purchaseDate?.toDate?.()?.toLocaleDateString('th-TH') || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-4">
                        {examOrder.status === "completed" ? (
                          <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                            <Link href={`/exams/${examOrder.examId}/view`}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              เข้าสู่ข้อสอบ
                            </Link>
                          </Button>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            รอการอนุมัติ
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={30} />
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ไม่มีคำสั่งซื้อที่รอดำเนินการ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* เพิ่ม TabsContent สำหรับสถานะ "in_progress" */}
            <TabsContent value="in_progress">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={30} />
                </div>
              ) : inProgressOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ไม่มีคำสั่งซื้อที่กำลังดำเนินการ</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size={30} />
                </div>
              ) : completedOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ไม่มีคำสั่งซื้อที่เสร็จสิ้น</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  )
}
