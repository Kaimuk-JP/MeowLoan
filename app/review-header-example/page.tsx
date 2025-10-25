"use client"

import { useState } from "react"
import { ReviewHeader } from "@/components/ui/review-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { Star, MessageCircle, Award, ThumbsUp } from "lucide-react"

export default function ReviewHeaderExample() {
  const [showDefault, setShowDefault] = useState(true)
  const [showDark, setShowDark] = useState(true)
  const [showGradient, setShowGradient] = useState(true)
  const [showPrimary, setShowPrimary] = useState(true)

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">ตัวอย่าง Review Header</h1>

          <div className="space-y-4">
            {/* Default Header */}
            {showDefault && (
              <ReviewHeader
                onClose={() => setShowDefault(false)}
                icon={<Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
              />
            )}

            {/* Dark Header */}
            {showDark && (
              <ReviewHeader
                variant="dark"
                title="ReviewHub"
                subtitle="รีวิวประสบการณ์ใหม่ๆ"
                actionText="เขียนรีวิว"
                onClose={() => setShowDark(false)}
                icon={<MessageCircle className="h-5 w-5 text-blue-400" />}
              />
            )}

            {/* Gradient Header */}
            {showGradient && (
              <ReviewHeader
                variant="gradient"
                title="ReviewHub Premium"
                subtitle="แชร์ความประทับใจ"
                actionText="อัพเกรด"
                onClose={() => setShowGradient(false)}
                icon={<Award className="h-5 w-5 text-purple-400" />}
              />
            )}

            {/* Primary Header */}
            {showPrimary && (
              <ReviewHeader
                variant="primary"
                title="ReviewHub Pro"
                subtitle="แชร์ความคิดเห็นของคุณ"
                actionText="ทดลองใช้ฟรี"
                onClose={() => setShowPrimary(false)}
                icon={<ThumbsUp className="h-5 w-5 text-white" />}
              />
            )}

            {/* Controls */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>ควบคุมการแสดงผล</CardTitle>
                <CardDescription>คลิกปุ่มเพื่อแสดงส่วนหัวแต่ละแบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={showDefault ? "outline" : "default"}
                    onClick={() => setShowDefault(!showDefault)}
                    className="w-full"
                  >
                    {showDefault ? "ซ่อน" : "แสดง"} แบบปกติ
                  </Button>
                  <Button
                    variant={showDark ? "outline" : "default"}
                    onClick={() => setShowDark(!showDark)}
                    className="w-full"
                  >
                    {showDark ? "ซ่อน" : "แสดง"} แบบมืด
                  </Button>
                  <Button
                    variant={showGradient ? "outline" : "default"}
                    onClick={() => setShowGradient(!showGradient)}
                    className="w-full"
                  >
                    {showGradient ? "ซ่อน" : "แสดง"} แบบไล่ส��
                  </Button>
                  <Button
                    variant={showPrimary ? "outline" : "default"}
                    onClick={() => setShowPrimary(!showPrimary)}
                    className="w-full"
                  >
                    {showPrimary ? "ซ่อน" : "แสดง"} แบบหลัก
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  onClick={() => {
                    setShowDefault(true)
                    setShowDark(true)
                    setShowGradient(true)
                    setShowPrimary(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-teal-500"
                >
                  แสดงทั้งหมด
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
