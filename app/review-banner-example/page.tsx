"use client"

import { useState } from "react"
import { ReviewBanner } from "@/components/ui/review-banner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { Star, MessageCircle, Award, ThumbsUp, X } from "lucide-react"

export default function ReviewBannerExample() {
  const [showDefault, setShowDefault] = useState(true)
  const [showDark, setShowDark] = useState(true)
  const [showGradient, setShowGradient] = useState(true)
  const [showCustom, setShowCustom] = useState(true)

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">ตัวอย่าง Review Banner</h1>

          <div className="space-y-8">
            {/* Default Banner */}
            {showDefault && (
              <ReviewBanner
                onClose={() => setShowDefault(false)}
                icon={<Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />}
              />
            )}

            {/* Dark Banner */}
            {showDark && (
              <ReviewBanner
                variant="dark"
                title="ReviewHub - รีวิวประสบการณ์ใหม่ๆ"
                onClose={() => setShowDark(false)}
                icon={<MessageCircle className="h-4 w-4 mr-2 text-blue-400" />}
              />
            )}

            {/* Gradient Banner */}
            {showGradient && (
              <ReviewBanner
                variant="gradient"
                title="ReviewHub - แชร์ความประทับใจ"
                onClose={() => setShowGradient(false)}
                icon={<Award className="h-4 w-4 mr-2 text-purple-400" />}
              />
            )}

            {/* Custom Banner */}
            {showCustom && (
              <div className="relative flex items-center justify-between px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-md shadow-md">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2 text-white" />
                  <span>ReviewHub - แชร์ความคิดเห็นของคุณ</span>
                </div>
                <button
                  onClick={() => setShowCustom(false)}
                  className="ml-2 rounded-full p-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Controls */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>ควบคุมการแสดงผล</CardTitle>
                <CardDescription>คลิกปุ่มเพื่อแสดงแบนเนอร์แต่ละแบบ</CardDescription>
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
                    {showGradient ? "ซ่อน" : "แสดง"} แบบไล่สี
                  </Button>
                  <Button
                    variant={showCustom ? "outline" : "default"}
                    onClick={() => setShowCustom(!showCustom)}
                    className="w-full"
                  >
                    {showCustom ? "ซ่อน" : "แสดง"} แบบกำหนดเอง
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  onClick={() => {
                    setShowDefault(true)
                    setShowDark(true)
                    setShowGradient(true)
                    setShowCustom(true)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-teal-500"
                >
                  แสดงทั้งหมด
                </Button>
              </CardFooter>
            </Card>

            {/* Example Usage */}
            <Card>
              <CardHeader>
                <CardTitle>วิธีการใช้งาน</CardTitle>
                <CardDescription>ตัวอย่างโค้ดสำหรับการใช้งาน ReviewBanner</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {`// แบบปกติ
<ReviewBanner />

// แบบมืด
<ReviewBanner 
  variant="dark" 
  title="ReviewHub - รีวิวประสบการณ์ใหม่ๆ" 
  icon={<MessageCircle className="h-4 w-4 mr-2 text-blue-400" />} 
/>

// แบบไล่สี
<ReviewBanner 
  variant="gradient" 
  title="ReviewHub - แชร์ความประทับใจ" 
  icon={<Award className="h-4 w-4 mr-2 text-purple-400" />} 
/>

// แบบกำหนดเอง
<ReviewBanner 
  className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-md shadow-md" 
  title="ReviewHub - แชร์ความคิดเห็นของคุณ" 
  icon={<ThumbsUp className="h-4 w-4 mr-2 text-white" />} 
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
