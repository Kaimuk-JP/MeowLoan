"use client"

import { useState } from "react"
import { ReviewNotification } from "@/components/ui/review-notification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { Star, MessageCircle, Award, ThumbsUp, Bell, Info, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function ReviewNotificationExample() {
  const [notifications, setNotifications] = useState<Array<{ id: number; props: any }>>([])
  const [nextId, setNextId] = useState(1)
  const [variant, setVariant] = useState("default")
  const [position, setPosition] = useState("top-right")
  const [duration, setDuration] = useState("5000")

  const addNotification = (customProps = {}) => {
    const id = nextId
    setNextId(id + 1)

    const props = {
      variant,
      position,
      duration: duration === "none" ? null : Number.parseInt(duration),
      onClose: () => removeNotification(id),
      ...customProps,
    }

    setNotifications([...notifications, { id, props }])
  }

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getIconForVariant = (variant: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />
      case "info":
        return <Info className="h-5 w-5 text-white" />
      case "gradient":
        return <Award className="h-5 w-5 text-purple-300" />
      case "dark":
        return <MessageCircle className="h-5 w-5 text-blue-300" />
      default:
        return <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
    }
  }

  const getMessageForVariant = (variant: string) => {
    switch (variant) {
      case "success":
        return "ขอบคุณสำหรับรีวิวของคุณ!"
      case "info":
        return "มีรีวิวใหม่ที่คุณอาจสนใจ"
      case "gradient":
        return "คุณได้รับรางวัลจากการรีวิว"
      case "dark":
        return "มีข้อความใหม่จากผู้ดูแลระบบ"
      default:
        return "แชร์ประสบการณ์ดีๆ"
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">ตัวอย่าง Review Notification</h1>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>ตั้งค่าการแจ้งเตือน</CardTitle>
              <CardDescription>ปรับแต่งการแจ้งเตือนตามต้องการ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="variant">รูปแบบ</Label>
                  <Select value={variant} onValueChange={setVariant}>
                    <SelectTrigger id="variant">
                      <SelectValue placeholder="เลือกรูปแบบ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">ปกติ</SelectItem>
                      <SelectItem value="dark">มืด</SelectItem>
                      <SelectItem value="gradient">ไล่สี</SelectItem>
                      <SelectItem value="success">สำเร็จ</SelectItem>
                      <SelectItem value="info">ข้อมูล</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger id="position">
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-right">บนขวา</SelectItem>
                      <SelectItem value="top-left">บนซ้าย</SelectItem>
                      <SelectItem value="bottom-right">ล่างขวา</SelectItem>
                      <SelectItem value="bottom-left">ล่างซ้าย</SelectItem>
                      <SelectItem value="top-center">บนกลาง</SelectItem>
                      <SelectItem value="bottom-center">ล่างกลาง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">ระยะเวลาแสดง</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="เลือกระยะเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3000">3 วินาที</SelectItem>
                      <SelectItem value="5000">5 วินาที</SelectItem>
                      <SelectItem value="10000">10 วินาที</SelectItem>
                      <SelectItem value="none">ไม่จำกัด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() =>
                  addNotification({
                    title: "ReviewHub",
                    message: getMessageForVariant(variant),
                    icon: getIconForVariant(variant),
                  })
                }
                className="bg-gradient-to-r from-blue-600 to-teal-500"
              >
                <Bell className="h-4 w-4 mr-2" />
                แสดงการแจ้งเตือน
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่างการแจ้งเตือนแบบต่างๆ</CardTitle>
              <CardDescription>คลิกปุ่มเพื่อแสดงการแจ้งเตือนแต่ละแบบ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      variant: "default",
                      title: "ReviewHub",
                      message: "แชร์ประสบการณ์ดีๆ",
                      icon: <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />,
                    })
                  }
                >
                  <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />
                  แบบปกติ
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      variant: "dark",
                      title: "ReviewHub",
                      message: "มีข้อความใหม่จากผู้ดูแลระบบ",
                      icon: <MessageCircle className="h-5 w-5 text-blue-300" />,
                    })
                  }
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                  แบบมืด
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      variant: "gradient",
                      title: "ReviewHub",
                      message: "คุณได้รับรางวัลจากการรีวิว",
                      icon: <Award className="h-5 w-5 text-purple-300" />,
                    })
                  }
                >
                  <Award className="h-4 w-4 mr-2 text-purple-500" />
                  แบบไล่สี
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      variant: "success",
                      title: "ReviewHub",
                      message: "ขอบคุณสำหรับรีวิวของคุณ!",
                      icon: <CheckCircle className="h-5 w-5 text-white" />,
                    })
                  }
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  แบบสำเร็จ
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      variant: "info",
                      title: "ReviewHub",
                      message: "มีรีวิวใหม่ที่คุณอาจสนใจ",
                      icon: <Info className="h-5 w-5 text-white" />,
                    })
                  }
                >
                  <Info className="h-4 w-4 mr-2 text-blue-500" />
                  แบบข้อมูล
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    addNotification({
                      className: "bg-gradient-to-r from-pink-500 to-purple-500",
                      title: "ReviewHub Premium",
                      message: "อัพเกรดเป็นสมาชิกพรีเมียมวันนี้!",
                      icon: <ThumbsUp className="h-5 w-5 text-white" />,
                    })
                  }
                >
                  <ThumbsUp className="h-4 w-4 mr-2 text-pink-500" />
                  แบบกำหนดเอง
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Render all active notifications */}
          {notifications.map((notification) => (
            <ReviewNotification key={notification.id} {...notification.props} />
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
