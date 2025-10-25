"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PageTransition } from "@/components/ui/page-transition"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, User, Mail, Phone, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form fields
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [studentId, setStudentId] = useState("")
  const [photoURL, setPhotoURL] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile")
    }
  }, [user, authLoading, router])

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            setDisplayName(data.displayName || "")
            setPhone(data.phone || "")
            setIdNumber(data.idNumber || "")
            setStudentId(data.studentId || "")
            setPhotoURL(data.photoURL || "")
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        }
      }
    }
    loadProfile()
  }, [user])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
      return
    }

    setUploading(true)
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file)

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: imageUrl,
        updatedAt: new Date(),
      })

      setPhotoURL(imageUrl)
      toast.success("อัพโหลดรูปโปรไฟล์สำเร็จ")
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phone: phone || null,
        idNumber: idNumber || null,
        studentId: studentId || null,
        updatedAt: new Date(),
      })

      setSuccess("บันทึกข้อมูลสำเร็จ")
      toast.success("บันทึกข้อมูลโปรไฟล์สำเร็จ")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
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
    return null
  }

  const getInitials = () => {
    if (displayName) {
      return displayName.substring(0, 2).toUpperCase()
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">โปรไฟล์ของฉัน</h1>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Picture Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>รูปโปรไฟล์</CardTitle>
                <CardDescription>อัพโหลดหรือเปลี่ยนรูปโปรไฟล์ของคุณ</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={photoURL} alt={displayName} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </div>
                {uploading && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                    <LoadingSpinner size={16} />
                    กำลังอัพโหลด...
                  </div>
                )}
                <p className="mt-4 text-sm text-gray-500 text-center">
                  คลิกที่รูปเพื่ออัพโหลดรูปใหม่
                  <br />
                  (ขนาดไฟล์สูงสุด 5MB)
                </p>
              </CardContent>
            </Card>

            {/* Profile Details Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      อีเมล
                    </Label>
                    <Input id="email" type="email" value={user.email || ""} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500">อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      ชื่อ-นามสกุล
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="กรุณากรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      เบอร์โทรศัพท์
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812345678"
                      maxLength={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      เลขบัตรประชาชน
                    </Label>
                    <Input
                      id="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="1234567891234"
                      maxLength={13}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentId">รหัสนิสิต</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="รหัสนิสิต"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner className="mr-2" size={16} />
                          กำลังบันทึก...
                        </>
                      ) : (
                        "บันทึกข้อมูล"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Account Information Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>ข้อมูลบัญชี</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">สถานะบัญชี</span>
                <span className="text-sm font-medium text-green-600">ใช้งานอยู่</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-gray-600">บทบาท</span>
                <span className="text-sm font-medium capitalize">
                  {userProfile?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm font-mono text-gray-800">{user.uid.substring(0, 16)}...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
