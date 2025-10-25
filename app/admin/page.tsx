"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageTransition } from "@/components/ui/page-transition"
// แก้ไขการ import โดยเพิ่ม deleteOrder
import {
  getOrders,
  getOrdersByStatus,
  updateOrderStatus,
  updateOrderDownloadUrl,
  deleteOrder,
  type OrderData,
} from "@/lib/db-service"
import { collection, getDocs, query, orderBy as fbOrderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
// เพิ่ม import สำหรับไอคอน Clock
// เพิ่ม import สำหรับ AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// เพิ่ม import สำหรับไอคอน Trash2
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Eye, LinkIcon, Clock, Trash2, BookOpen } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { useAuth } from "@/components/auth/auth-provider"
import { signIn } from "@/lib/auth-service"
import { toast } from "sonner"

export default function AdminPage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<OrderData[]>([])
  const [examOrders, setExamOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  const [selectedExamOrder, setSelectedExamOrder] = useState<any | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [savingUrl, setSavingUrl] = useState(false)
  const [urlSuccess, setUrlSuccess] = useState(false)
  const router = useRouter()
  // เพิ่ม state สำหรับ dialog ยืนยันการลบ ในฟังก์ชัน AdminPage
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && user && userProfile) {
      if (userProfile.role === "admin") {
        setIsAuthenticated(true)
        setShowLoginDialog(false)
      } else {
        // Redirect non-admin users
        router.push("/dashboard")
      }
    }
  }, [user, userProfile, authLoading, router])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      let fetchedOrders: OrderData[]

      if (activeTab === "all" || activeTab === "pending" || activeTab === "in_progress" || activeTab === "completed") {
        if (activeTab === "all") {
          fetchedOrders = await getOrders()
        } else {
          fetchedOrders = await getOrdersByStatus(activeTab as "pending" | "completed")
        }
        setOrders(fetchedOrders)
      } else if (activeTab === "exams") {
        // Fetch exam orders
        const examOrdersRef = collection(db, "examOrders")
        const q = query(examOrdersRef, fbOrderBy("purchaseDate", "desc"))
        const snapshot = await getDocs(q)
        const examOrdersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setExamOrders(examOrdersData)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, activeTab])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signIn(username, password)

      // In preview environment, check if the user is admin@example.com
      if (process.env.NODE_ENV === "development" || typeof window !== "undefined") {
        if (username === "admin@example.com") {
          setIsAuthenticated(true)
          setShowLoginDialog(false)
          return
        } else {
          setError("คุณไม่มีสิทธิ์เข้าถึงหน้านี้")
          return
        }
      }

      // For production, check if user is admin
      if (userProfile?.role === "admin") {
        setIsAuthenticated(true)
        setShowLoginDialog(false)
      } else {
        setError("คุณไม่มีสิทธิ์เข้าถึงหน้านี้")
      }
    } catch (error: any) {
      console.error("Error signing in:", error)

      // Handle different Firebase auth errors
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      } else {
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: "pending" | "in_progress" | "completed") => {
    setLoading(true)

    try {
      await updateOrderStatus(orderId, newStatus)

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      setError("ไม่สามารถอัพเดทสถานะคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDownloadUrl = async () => {
    if (!selectedOrder || !selectedOrder.id || !downloadUrl) return

    setSavingUrl(true)
    setUrlSuccess(false)
    setError(null)

    try {
      await updateOrderDownloadUrl(selectedOrder.id, downloadUrl)

      // Update local state
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, downloadUrl: downloadUrl } : order)))
      setSelectedOrder({ ...selectedOrder, downloadUrl: downloadUrl })
      setUrlSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setUrlSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error updating download URL:", error)
      setError("ไม่สามารถบันทึก URL ดาวน์โหลดได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSavingUrl(false)
    }
  }

  const viewOrderDetails = (order: OrderData) => {
    setSelectedOrder(order)
    setDownloadUrl(order.downloadUrl || "")
    setUrlSuccess(false)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-"

    try {
      // Convert Firestore Timestamp to JavaScript Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, "d MMMM yyyy, HH:mm", { locale: th })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "-"
    }
  }

  // เพิ่มฟังก์ชัน handleDeleteOrder ในฟังก์ชัน AdminPage
  const handleDeleteOrder = async (orderId: string) => {
    setLoading(true)
    setError(null)

    try {
      await deleteOrder(orderId)

      // Update local state
      setOrders(orders.filter((order) => order.id !== orderId))

      // Close dialog if open
      setOrderToDelete(null)

      // Close order details if the deleted order was selected
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      setError("ไม่สามารถลบคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  // เพิ่มฟังก์ชันอัปเดตสถานะข้อสอบ
  const handleApproveExamOrder = async (examOrderId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { doc, updateDoc } = await import("firebase/firestore")
      const examOrderRef = doc(db, "examOrders", examOrderId)
      
      await updateDoc(examOrderRef, {
        status: "completed"
      })

      // Update local state
      setExamOrders(examOrders.map((order) => 
        order.id === examOrderId ? { ...order, status: "completed" } : order
      ))

      toast.success('อนุมัติคำสั่งซื้อสำเร็จ')
      setSelectedExamOrder(null)
      
      // Refresh data
      fetchOrders()
    } catch (error) {
      console.error("Error approving exam order:", error)
      toast.error("ไม่สามารถอนุมัติคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันดึงตัวอย่างข้อสอบ
  const [examPreview, setExamPreview] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const loadExamPreview = async (examId: string) => {
    setLoadingPreview(true)
    try {
      const { doc, getDoc } = await import("firebase/firestore")
      const examRef = doc(db, "exams", examId)
      const examSnap = await getDoc(examRef)
      
      if (examSnap.exists()) {
        const examData = examSnap.data()
        // ดึงข้อสอบ 10 ข้อแรก
        const preview = {
          title: examData.title,
          questions: examData.questions?.slice(0, 10) || []
        }
        setExamPreview(preview)
      } else {
        toast.error("ไม่พบข้อมูลข้อสอบ")
      }
    } catch (error) {
      console.error("Error loading exam preview:", error)
      toast.error("ไม่สามารถโหลดตัวอย่างข้อสอบได้")
    } finally {
      setLoadingPreview(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={40} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
          <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">เข้าสู่ระบบผู้ดูแล</DialogTitle>
                <DialogDescription>กรุณาใส่ชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ระบบ</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>ข้อผิดพลาด</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">อีเมล</Label>
                  <Input
                    id="username"
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">ระบบจัดการคำสั่งซื้อ</CardTitle>
                <CardDescription className="text-blue-100">จัดการคำสั่งซื้อและตรวจสอบการชำระเงิน</CardDescription>
              </div>
             
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

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-100 flex flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm flex-1 min-w-[80px]">บริการ</TabsTrigger>
                <TabsTrigger value="exams" className="text-xs sm:text-sm flex-1 min-w-[80px]">ข้อสอบ</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm flex-1 min-w-[80px]">รอดำเนินการ</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs sm:text-sm flex-1 min-w-[80px]">กำลังดำเนินการ</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm flex-1 min-w-[80px]">เสร็จสิ้น</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <OrdersTable
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  formatDate={formatDate}
                  onDeleteOrder={(id) => setOrderToDelete(id)}
                />
              </TabsContent>

              <TabsContent value="exams">
                <ExamOrdersTable
                  examOrders={examOrders}
                  loading={loading}
                  formatDate={formatDate}
                  onViewDetails={(order) => setSelectedExamOrder(order)}
                />
              </TabsContent>

              <TabsContent value="pending">
                <OrdersTable
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  formatDate={formatDate}
                  onDeleteOrder={(id) => setOrderToDelete(id)}
                />
              </TabsContent>

              <TabsContent value="completed">
                <OrdersTable
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  formatDate={formatDate}
                  onDeleteOrder={(id) => setOrderToDelete(id)}
                />
              </TabsContent>
              <TabsContent value="in_progress">
                <OrdersTable
                  orders={orders}
                  onStatusChange={handleStatusChange}
                  onViewDetails={viewOrderDetails}
                  loading={loading}
                  formatDate={formatDate}
                  onDeleteOrder={(id) => setOrderToDelete(id)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">รายละเอียดคำสั่งซื้อ #{selectedOrder.id}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3 text-lg">ข้อมูลลูกค้า</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ชื่อ:</span>
                      <span className="font-medium">{selectedOrder.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">เลขบัตรประชาชน:</span>
                      <span className="font-medium">{selectedOrder.idNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">รหัสเข้ากยศคอนเน็ค:</span>
                      <span className="font-medium">{selectedOrder.connectId}</span>
                    </div>
                    {selectedOrder.studentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">รหัสนิสิต:</span>
                        <span className="font-medium">{selectedOrder.studentId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">เบอร์โทรศัพท์:</span>
                      <span className="font-medium">{selectedOrder.phone}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">หมายเหตุ:</span>
                        <span className="font-medium">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium mb-3 mt-6 text-lg">ข้อมูลการสั่งซื้อ</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ประเภท:</span>
                      <span className="font-medium">
                        {selectedOrder.type === "hourly" && "รายชั่วโมง"}
                        {selectedOrder.type === "package" && "แพ็คเกจ 36 ชั่วโมง"}
                        {selectedOrder.type === "system" && "กรอกข้อมูลลงระบบ"}
                      </span>
                    </div>
                    {selectedOrder.hours > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">จำนวนชั่วโมง:</span>
                        <span className="font-medium">{selectedOrder.hours} ชั่วโมง</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">กรอกข้อมูลลงระบบ:</span>
                      <span className="font-medium">{selectedOrder.includeSystem ? "ใช่" : "ไม่ใช่"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ยอดชำระ:</span>
                      <span className="font-medium">{selectedOrder.amount} บาท</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">วันที่สั่งซื้อ:</span>
                      <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">สถานะ:</span>
                      <Badge variant={selectedOrder.status === "completed" ? "default" : "outline"}>
                        {selectedOrder.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                      </Badge>
                    </div>
                  </div>

                  {/* เพิ่มส่วนสำหรับ URL ดาวน์โหลด */}
                  <h3 className="font-medium mb-3 mt-6 text-lg">URL ดาวน์โหลดไฟล์งาน</h3>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="downloadUrl">URL สำหรับดาวน์โหลดไฟล์งาน</Label>
                      <div className="flex gap-2">
                        <Input
                          id="downloadUrl"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                          placeholder="https://example.com/file.zip"
                          className="flex-1"
                        />
                        <Button onClick={handleSaveDownloadUrl} disabled={savingUrl || !downloadUrl} size="sm">
                          {savingUrl ? (
                            <LoadingSpinner className="mr-2" size={16} />
                          ) : (
                            <LinkIcon className="mr-2 h-4 w-4" />
                          )}
                          บันทึก
                        </Button>
                      </div>
                      {urlSuccess && <p className="text-sm text-green-600">บันทึก URL เรียบร้อยแล้ว</p>}
                      {selectedOrder.downloadUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 mb-1">URL ปัจจุบัน:</p>
                          <a
                            href={selectedOrder.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {selectedOrder.downloadUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button
                      className="w-full"
                      variant={selectedOrder.status === "completed" ? "outline" : "default"}
                      onClick={() => {
                        handleStatusChange(
                          selectedOrder.id!,
                          selectedOrder.status === "completed" ? "pending" : "completed",
                        )
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <LoadingSpinner className="mr-2" />
                      ) : selectedOrder.status === "completed" ? (
                        <XCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {selectedOrder.status === "completed" ? "เปลี่ยนเป็นรอดำเนินการ" : "เปลี่ยนเป็นเสร็จสิ้น"}
                    </Button>

                    {/* เพิ่มปุ่มลบคำสั่งซื้อ */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(null) // ปิดหน้ารายละเอียด
                        setOrderToDelete(selectedOrder.id!) // เปิด dialog ยืนยันการลบ
                      }}
                      disabled={loading}
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      ลบคำสั่งซื้อนี้
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-lg">สลิปการชำระเงิน</h3>
                  {selectedOrder.paymentSlipUrl ? (
                    <div className="border rounded-md overflow-hidden bg-white">
                      <img
                        src={selectedOrder.paymentSlipUrl || "/placeholder.svg"}
                        alt="Payment Slip"
                        className="w-full h-auto"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-md p-8 text-center bg-gray-50">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">ยังไม่มีสลิปการชำระเงิน</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Dialog ยืนยันการลบคำสั่งซื้อ */}
        <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบคำสั่งซื้อ</AlertDialogTitle>
              <AlertDialogDescription>
                คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ และข้อมูลทั้งหมดจะถูกลบออกจากระบบ
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => orderToDelete && handleDeleteOrder(orderToDelete)}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {loading ? <LoadingSpinner className="mr-2" size={16} /> : <Trash2 className="mr-2 h-4 w-4" />}
                ลบคำสั่งซื้อ
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog แสดงรายละเอียดการซื้อข้อสอบ */}
        {selectedExamOrder && (
          <Dialog open={!!selectedExamOrder} onOpenChange={() => setSelectedExamOrder(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">รายละเอียดคำสั่งซื้อ #{selectedExamOrder.id?.substring(0, 8)}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* ข้อมูลคำสั่งซื้อในแถวเดียว */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-base sm:text-lg mb-4 text-blue-900 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    ข้อมูลคำสั่งซื้อ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">ชื่อข้อสอบ</span>
                      <span className="font-medium text-sm sm:text-base break-words">{selectedExamOrder.examTitle}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">อีเมลผู้ซื้อ</span>
                      <span className="font-medium text-sm sm:text-base break-all">{selectedExamOrder.userEmail}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">ยอดชำระ</span>
                      <span className="font-medium text-lg sm:text-xl text-green-600">฿{selectedExamOrder.amount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">วันที่ซื้อ</span>
                      <span className="font-medium text-sm sm:text-base">{formatDate(selectedExamOrder.purchaseDate)}</span>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">สถานะ</span>
                      <Badge
                        className={
                          selectedExamOrder.status === "completed"
                            ? "bg-green-500 hover:bg-green-600"
                            : selectedExamOrder.status === "paid"
                              ? "bg-blue-500 hover:bg-blue-600"
                              : "bg-amber-500 hover:bg-amber-600"
                        }
                      >
                        {selectedExamOrder.status === "completed"
                          ? "เสร็จสิ้น"
                          : selectedExamOrder.status === "paid"
                            ? "ชำระเงินแล้ว"
                            : "รอตรวจสอบ"}
                      </Badge>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs sm:text-sm text-gray-500 block mb-1">รหัสข้อสอบ</span>
                      <span className="font-medium text-sm sm:text-base font-mono">{selectedExamOrder.examId?.substring(0, 12)}...</span>
                    </div>
                  </div>
                </div>

                {/* สลิปการชำระเงิน */}
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center text-gray-800">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    สลิปการชำระเงิน
                  </h3>
                  {selectedExamOrder.paymentSlipUrl ? (
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-md">
                      <img
                        src={selectedExamOrder.paymentSlipUrl}
                        alt="Payment Slip"
                        className="w-full h-auto max-h-[500px] object-contain"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center bg-gray-50">
                      <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm sm:text-base">ยังไม่มีสลิปการชำระเงิน</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ปุ่มจัดการ */}
              <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 w-full sm:w-auto"
                  onClick={() => handleApproveExamOrder(selectedExamOrder.id)}
                  disabled={loading || selectedExamOrder.status === "completed"}
                >
                  {loading ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {selectedExamOrder.status === "completed" ? "อนุมัติแล้ว" : "อนุมัติคำสั่งซื้อ"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    loadExamPreview(selectedExamOrder.examId)
                  }}
                  className="w-full sm:w-auto"
                  disabled={loadingPreview}
                >
                  {loadingPreview ? (
                    <LoadingSpinner className="h-4 w-4 mr-2" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-2" />
                  )}
                  ตัวอย่างข้อสอบ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedExamOrder(null)}
                  className="w-full sm:w-auto"
                >
                  ปิด
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog แสดงตัวอย่างข้อสอบ */}
        {examPreview && (
          <Dialog open={!!examPreview} onOpenChange={() => setExamPreview(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">ตัวอย่างเฉลยข้อสอบ</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">{examPreview.title}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {examPreview.questions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">ไม่มีข้อสอบในชุดนี้</p>
                  </div>
                ) : (
                  examPreview.questions.map((question: any, index: number) => (
                    <Card key={index} className="shadow-sm border-l-4 border-l-blue-500">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* คำถาม */}
                          <div>
                            <div className="flex items-start gap-2 mb-3">
                              <Badge className="bg-blue-500 text-white shrink-0">ข้อ {index + 1}</Badge>
                              <h4 className="font-medium text-sm sm:text-base flex-1 break-words">
                                {question.question}
                              </h4>
                            </div>

                            {/* รูปภาพคำถาม */}
                            {question.imageUrl && (
                              <div className="my-3 border rounded-lg overflow-hidden bg-gray-50">
                                <img 
                                  src={question.imageUrl} 
                                  alt={`คำถามข้อ ${index + 1}`}
                                  className="w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                            )}
                          </div>

                          {/* ตัวเลือก */}
                          <div className="space-y-2 pl-2">
                            {question.options?.map((option: string, optIndex: number) => {
                              const optionLabel = ['ก', 'ข', 'ค', 'ง'][optIndex]
                              const isCorrect = question.correctAnswer === optionLabel
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-md border-2 ${
                                    isCorrect 
                                      ? 'border-green-500 bg-green-50' 
                                      : 'border-gray-200 bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <span className={`font-semibold shrink-0 ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                                      {optionLabel}.
                                    </span>
                                    <span className={`text-sm flex-1 break-words ${isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                                      {option}
                                    </span>
                                    {isCorrect && (
                                      <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* เฉลย */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 bg-green-100 p-3 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-green-900">เฉลย: </span>
                                <span className="text-sm text-green-800">
                                  ตัวเลือก {question.correctAnswer}
                                  {question.options && question.correctAnswer && 
                                    ` - ${question.options[['ก', 'ข', 'ค', 'ง'].indexOf(question.correctAnswer)]}`
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t flex justify-end">
                <Button onClick={() => setExamPreview(null)}>
                  ปิด
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageTransition>
  )
}

// แก้ไขฟังก์ชัน OrdersTable เพื่อแสดงสถานะ "in_progress" ด้วยสีที่แตกต่าง
function OrdersTable({
  orders,
  onStatusChange,
  onViewDetails,
  loading,
  formatDate,
  onDeleteOrder,
}: {
  orders: OrderData[]
  onStatusChange: (id: string, status: "pending" | "in_progress" | "completed") => void
  onViewDetails: (order: OrderData) => void
  loading: boolean
  formatDate: (timestamp: any) => string
  onDeleteOrder: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {/* Desktop View - Hidden on Mobile */}
      <div className="hidden lg:block border rounded-md overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>รหัสคำสั่งซื้อ</TableHead>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>จำนวนเงิน</TableHead>
              <TableHead>วันที่</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <LoadingSpinner className="mx-auto" />
                  <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
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
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">ไม่พบข้อมูลคำสั่งซื้อ</p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{order.id?.substring(0, 8)}</TableCell>
                  <TableCell>{order.fullName}</TableCell>
                  <TableCell>
                    {order.type === "hourly" && "รายชั่วโมง"}
                    {order.type === "package" && "แพ็คเกจ 36 ชั่วโมง"}
                    {order.type === "system" && "บริการกรอกข้อมูลลงระบบ"}
                  </TableCell>
                  <TableCell>{order.amount} บาท</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        ดูรายละเอียด
                      </Button>
                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(order.id!, "in_progress")}
                          className="border-amber-500 text-amber-500 hover:bg-amber-50"
                          disabled={loading}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          กำลังดำเนินการ
                        </Button>
                      )}
                      {order.status === "in_progress" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onStatusChange(order.id!, "completed")}
                          disabled={loading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          เสร็จสิ้น
                        </Button>
                      )}
                      {order.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStatusChange(order.id!, "pending")}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          ยกเลิก
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => onDeleteOrder(order.id!)} disabled={loading}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        ลบ
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner className="mx-auto" />
            <p className="mt-2 text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">ไม่พบข้อมูลคำสั่งซื้อ</p>
          </div>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">รหัสคำสั่งซื้อ</p>
                      <p className="font-medium text-sm">#{order.id?.substring(0, 8)}</p>
                    </div>
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

                  <div>
                    <p className="text-xs text-gray-500 mb-1">ชื่อลูกค้า</p>
                    <p className="font-medium text-sm">{order.fullName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ประเภท</p>
                      <p className="text-xs">
                        {order.type === "hourly" && "รายชั่วโมง"}
                        {order.type === "package" && "แพ็คเกจ 36 ชม."}
                        {order.type === "system" && "กรอกข้อมูล"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">จำนวนเงิน</p>
                      <p className="font-semibold text-green-600">{order.amount} บาท</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">วันที่</p>
                    <p className="text-xs">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(order)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      ดูรายละเอียด
                    </Button>

                    {order.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(order.id!, "in_progress")}
                        className="border-amber-500 text-amber-500 hover:bg-amber-50 text-xs"
                        disabled={loading}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        ดำเนินการ
                      </Button>
                    )}

                    {order.status === "in_progress" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onStatusChange(order.id!, "completed")}
                        disabled={loading}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        เสร็จสิ้น
                      </Button>
                    )}

                    {order.status === "completed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange(order.id!, "pending")}
                        disabled={loading}
                        className="text-xs"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        ยกเลิก
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteOrder(order.id!)}
                    disabled={loading}
                    className="w-full text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    ลบคำสั่งซื้อ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// ExamOrdersTable Component
function ExamOrdersTable({
  examOrders,
  loading,
  formatDate,
  onViewDetails,
}: {
  examOrders: any[]
  loading: boolean
  formatDate: (timestamp: any) => string
  onViewDetails: (order: any) => void
}) {
  return (
    <div className="space-y-4">
      {/* Desktop View - Hidden on Mobile */}
      <div className="hidden md:block border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>รหัสคำสั่งซื้อ</TableHead>
              <TableHead>ชื่อข้อสอบ</TableHead>
              <TableHead>อีเมลลูกค้า</TableHead>
              <TableHead>จำนวนเงิน</TableHead>
              <TableHead>วันที่ซื้อ</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">การจัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <LoadingSpinner className="mx-auto" />
                  <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                </TableCell>
              </TableRow>
            ) : examOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <BookOpen className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">ไม่พบข้อมูลการซื้อข้อสอบ</p>
                </TableCell>
              </TableRow>
            ) : (
              examOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{order.id?.substring(0, 8)}</TableCell>
                  <TableCell>{order.examTitle}</TableCell>
                  <TableCell>{order.userEmail}</TableCell>
                  <TableCell>฿{order.amount}</TableCell>
                  <TableCell>{formatDate(order.purchaseDate)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        order.status === "completed"
                          ? "bg-green-500 hover:bg-green-600"
                          : order.status === "paid"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-amber-500 hover:bg-amber-600"
                      }
                    >
                      {order.status === "completed"
                        ? "เสร็จสิ้น"
                        : order.status === "paid"
                          ? "ชำระเงินแล้ว"
                          : "รอตรวจสอบ"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => onViewDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      ดูรายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner className="mx-auto" />
            <p className="mt-2 text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
          </div>
        ) : examOrders.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">ไม่พบข้อมูลการซื้อข้อสอบ</p>
          </div>
        ) : (
          examOrders.map((order) => (
            <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">รหัสคำสั่งซื้อ</p>
                      <p className="font-medium text-sm">#{order.id?.substring(0, 8)}</p>
                    </div>
                    <Badge
                      className={
                        order.status === "completed"
                          ? "bg-green-500 hover:bg-green-600"
                          : order.status === "paid"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-amber-500 hover:bg-amber-600"
                      }
                    >
                      {order.status === "completed"
                        ? "เสร็จสิ้น"
                        : order.status === "paid"
                          ? "ชำระแล้ว"
                          : "รอตรวจสอบ"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">ชื่อข้อสอบ</p>
                    <p className="font-medium text-sm break-words">{order.examTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ยอดชำระ</p>
                      <p className="font-semibold text-green-600">฿{order.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">วันที่ซื้อ</p>
                      <p className="text-xs">{formatDate(order.purchaseDate)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">อีเมล</p>
                    <p className="text-xs break-all">{order.userEmail}</p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onViewDetails(order)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    ดูรายละเอียด
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
