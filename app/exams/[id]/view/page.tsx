'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { getExamById, getExamWithQuestions, type Exam } from '@/lib/exam-service'
import { useAuth } from '@/components/auth/auth-provider'
import { PageTransition } from '@/components/ui/page-transition'
import { BookOpen, ArrowLeft, CheckCircle2, XCircle, Search } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ViewExamPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [exam, setExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // ป้องกันการแคปหน้าจอ - เข้มงวดกว่าหน้ารายการข้อสอบ
  useEffect(() => {
    const preventScreenCapture = () => {
      let isBlackoutActive = false
      let blackoutTimer: NodeJS.Timeout | null = null
      let monitoringInterval: NodeJS.Timeout | null = null

      // ฟังก์ชันทำให้หน้าจอดำ
      const activateBlackout = (duration: number = 3000) => {
        isBlackoutActive = true
        document.body.style.filter = 'brightness(0) blur(30px)'
        document.body.style.transition = 'filter 0.05s'
        
        if (blackoutTimer) clearTimeout(blackoutTimer)
        
        blackoutTimer = setTimeout(() => {
          document.body.style.filter = ''
          isBlackoutActive = false
        }, duration)
      }

      // ตรวจจับ Snipping Tool และ Screenshot Tools อื่นๆ
      const monitorScreenCapture = () => {
        // ตรวจสอบ document focus และ visibility อย่างต่อเนื่อง
        monitoringInterval = setInterval(() => {
          // ถ้าหน้าจอไม่ focus หรือซ่อนอยู่ → อาจกำลังใช้ snipping tool
          if (!document.hasFocus() || document.hidden) {
            if (!isBlackoutActive) {
              document.body.style.filter = 'brightness(0) blur(30px)'
              document.body.style.transition = 'none'
            }
          } else if (!isBlackoutActive) {
            document.body.style.filter = ''
          }
        }, 50) // ตรวจทุก 50ms เพื่อให้จับได้เร็ว
      }

      // เริ่มการตรวจสอบ
      monitorScreenCapture()

      // สร้าง Protection Overlay ที่ทำให้รูปแคปเป็นสีดำ
      const createProtectionOverlay = () => {
        const overlay = document.createElement('div')
        overlay.id = 'screen-protection-overlay'
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 999999;
          mix-blend-mode: difference;
          background: rgba(0, 0, 0, 0.02);
        `
        document.body.appendChild(overlay)
        return overlay
      }

      const overlay = createProtectionOverlay()

      // ป้องกัน Print Screen - ทำให้ดำนาน 3 วินาที
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'PrintScreen') {
          navigator.clipboard.writeText('')
          activateBlackout(3000) // ดำ 3 วินาที
          toast.error('⚠️ ห้ามแคปหน้าจอข้อสอบ! หน้าจอจะดำ 3 วินาที')
        }
      }

      // ป้องกัน Screenshot shortcuts - ทำให้ดำนาน 3 วินาที
      const handleKeyDown = (e: KeyboardEvent) => {
        // ตรวจจับ Win+Shift+S (Snipping Tool) และ shortcuts อื่นๆ
        const isWinKey = e.key === 'Meta' || e.metaKey || e.key === 'Win'
        const isCmdKey = e.metaKey
        
        // Windows Snipping Tool: Win+Shift+S
        if (e.shiftKey && (isWinKey || e.key === 's' || e.key === 'S')) {
          e.preventDefault()
          activateBlackout(5000) // ดำ 5 วินาที สำหรับ snipping tool
          toast.error('⚠️ ตรวจพบ Snipping Tool! หน้าจอจะดำ 5 วินาที')
          return false
        }

        // Mac screenshot shortcuts
        if (e.shiftKey && isCmdKey && ['3', '4', '5'].includes(e.key)) {
          e.preventDefault()
          activateBlackout(3000)
          toast.error('⚠️ ห้ามแคปหน้าจอข้อสอบ! หน้าจอจะดำ 3 วินาที')
          return false
        }

        // Print Screen
        if (e.key === 'PrintScreen') {
          e.preventDefault()
          activateBlackout(3000)
          toast.error('⚠️ ห้ามแคปหน้าจอข้อสอบ! หน้าจอจะดำ 3 วินาที')
          return false
        }

        // ป้องกัน Developer Tools
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault()
          toast.error('⚠️ ห้ามเปิด Developer Tools')
          return false
        }
      }

      // ป้องกัน Context Menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        toast.warning('⚠️ ปิดการใช้งานคลิกขวา')
        return false
      }

      // ตรวจจับการเปิด Developer Tools
      const detectDevTools = () => {
        const threshold = 160
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold
        
        if (widthThreshold || heightThreshold) {
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:24px;color:red;">⚠️ ตรวจพบการเปิด Developer Tools - กรุณาปิดเพื่อดำเนินการต่อ</div>'
        }
      }

      // ตรวจจับ visibility change และทำให้หน้าจอดำตลอดเมื่อซ่อน
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // ทำให้หน้าจอดำตลอดเมื่อสลับ tab หรือเปิด snipping tool
          document.body.style.filter = 'brightness(0) blur(30px)'
          document.body.style.transition = 'none'
          console.warn('⚠️ หน้าจอถูกซ่อน - กำลังป้องกันการบันทึกหน้าจอ')
          toast.warning('⚠️ ตรวจพบการสลับหน้าต่าง/เปิด Screenshot Tool')
        } else {
          // คืนค่าเมื่อกลับมาที่หน้านี้
          if (!isBlackoutActive) {
            setTimeout(() => {
              document.body.style.filter = ''
            }, 100)
          }
        }
      }

      // Disable text selection และ drag + ป้องกันการแคปรูป
      const style = document.createElement('style')
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }
        input, textarea {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        img {
          pointer-events: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        
        /* ทำให้รูปดำเมื่อ print หรือ screenshot */
        @media print {
          body, * {
            filter: brightness(0) blur(30px) !important;
            background: black !important;
            color: transparent !important;
          }
        }
        
        /* ป้องกัน CSS inspector */
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 999998;
          background: transparent;
        }
      `
      document.head.appendChild(style)

      // Add event listeners
      document.addEventListener('keyup', handleKeyUp)
      document.addEventListener('keydown', handleKeyDown, true) // ใช้ capture phase
      document.addEventListener('contextmenu', handleContextMenu)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // Check for dev tools every second
      const devToolsInterval = setInterval(detectDevTools, 1000)

      // ตรวจจับ blur event - ทำให้ดำตลอดจนกว่าจะ focus กลับมา
      const handleBlur = () => {
        document.body.style.filter = 'brightness(0) blur(30px)'
        document.body.style.transition = 'none'
        toast.warning('⚠️ ตรวจพบการสลับหน้าต่าง')
      }

      const handleFocus = () => {
        if (!isBlackoutActive && !document.hidden) {
          setTimeout(() => {
            document.body.style.filter = ''
          }, 100)
        }
      }

      window.addEventListener('blur', handleBlur)
      window.addEventListener('focus', handleFocus)

      // ตรวจจับ mouse leave (อาจกำลังไปคลิก snipping tool)
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 || e.clientX <= 0 || 
            e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
          // เมาส์ออกจากหน้าต่าง - อาจไปคลิกเครื่องมือแคปหน้าจอ
          if (!isBlackoutActive) {
            document.body.style.filter = 'brightness(0) blur(20px)'
          }
        }
      }

      const handleMouseEnter = () => {
        if (!isBlackoutActive && document.hasFocus()) {
          document.body.style.filter = ''
        }
      }

      document.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('mouseenter', handleMouseEnter)

      // Cleanup function
      return () => {
        document.removeEventListener('keyup', handleKeyUp)
        document.removeEventListener('keydown', handleKeyDown, true)
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        document.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('mouseenter', handleMouseEnter)
        window.removeEventListener('blur', handleBlur)
        window.removeEventListener('focus', handleFocus)
        clearInterval(devToolsInterval)
        if (monitoringInterval) clearInterval(monitoringInterval)
        if (blackoutTimer) clearTimeout(blackoutTimer)
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
        if (style.parentNode) style.parentNode.removeChild(style)
        document.body.style.filter = ''
      }
    }

    const cleanup = preventScreenCapture()
    return cleanup
  }, [user])

  useEffect(() => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนดูข้อสอบ')
      router.push('/login')
      return
    }
    loadExam()
  }, [user])

  const loadExam = async () => {
    try {
      setLoading(true)
      
      // ใช้ getExamWithQuestions เพื่อดึง questions มาด้วย
      const examData = await getExamWithQuestions(params.id as string)
      
      if (!examData) {
        toast.error('ไม่พบข้อมูลข้อสอบ')
        router.push('/exams')
        return
      }
      
      
      setExam(examData)
    } catch (error) {
      toast.error('ไม่สามารถโหลดข้อมูลข้อสอบได้')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    })
  }

  const handleSubmitExam = () => {
    if (!exam?.questions) return
    
    let correctCount = 0
    exam.questions.forEach((q: any, index: number) => {
      if (selectedAnswers[index] === q.answer) {
        correctCount++
      }
    })
    
    setScore(correctCount)
    setShowResults(true)
    toast.success(`คุณทำได้ ${correctCount} ข้อถูกจาก ${exam.questions.length} ข้อ`)
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

  // กรองคำถามตามการค้นหา
  const filteredQuestions = exam.questions?.filter((question: any) => 
    question.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-4">
          <Button className="mb-6" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปหน้า Dashboard
            </Link>
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <Card className="mb-8">
              <CardHeader>
                
                <CardTitle className="text-3xl">{exam.title}</CardTitle>
              </CardHeader>
              
            </Card>

            {/* Search Bar */}
            {exam.questions && exam.questions.length > 0 && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="ค้นหาคำถาม..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {searchQuery && (
                    <p className="text-sm text-gray-500 mt-2">
                      พบ {filteredQuestions.length} คำถามจาก {exam.questions.length} คำถาม
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Questions */}
            {exam.questions && exam.questions.length > 0 ? (
              <div className="space-y-6">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question: any, originalIndex: number) => {
                    // หาตำแหน่งเดิมของคำถามใน array เต็ม
                    const index = exam.questions?.indexOf(question) || 0
                    
                    return (
                      <Card key={index} className={showResults ? 'border-2' : ''} style={{
                        borderColor: showResults 
                          ? (selectedAnswers[index] === question.answer ? '#10b981' : '#ef4444')
                          : undefined
                      }}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start gap-2">
                            <span className="flex-1">{question.question}</span>
                            {showResults && (
                              selectedAnswers[index] === question.answer ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                              )
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div
                            onClick={() => !showResults && handleAnswerSelect(index, question.answer)}
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${
                              selectedAnswers[index] === question.answer
                                ? showResults
                                  ? 'bg-green-100 border-2 border-green-500'
                                  : 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium"> {question.answer}</span>
                            {showResults && <span className="ml-2 text-green-600">(คำตอบที่ถูกต้อง)</span>}
                          </div>
                          
                          {showResults && selectedAnswers[index] && selectedAnswers[index] !== question.answer && (
                            <div className="p-4 rounded-lg bg-red-100 border-2 border-red-500">
                              <span className="font-medium text-red-600">✗ {selectedAnswers[index]}</span>
                              <span className="ml-2 text-red-600">(คำตอบของคุณ)</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">ไม่พบคำถามที่ตรงกับการค้นหา &quot;{searchQuery}&quot;</p>
                    </CardContent>
                  </Card>
                )}

                {!showResults && (
                  <Card className="bg-blue-50">     </Card>
                )}

                {showResults && (
                  <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold mb-2">ผลการทำข้อสอบ</h3>
                        <div className="text-5xl font-bold my-4">
                          {score} / {exam.questions.length}
                        </div>
                        <p className="text-lg mb-4">
                          คะแนนเฉลี่ย: {((score / exam.questions.length) * 100).toFixed(2)}%
                        </p>
                        <div className="flex gap-4 justify-center">
                          <Button 
                            onClick={() => {
                              setSelectedAnswers({})
                              setShowResults(false)
                              setScore(0)
                            }}
                            className="bg-white text-blue-600 hover:bg-gray-100"
                          >
                            ทำใหม่อีกครั้ง
                          </Button>
                          <Button 
                            asChild
                            className="bg-white/20 hover:bg-white/30"
                          >
                            <Link href="/dashboard">
                              กลับหน้า Dashboard
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">ข้อสอบนี้ยังไม่มีคำถาม</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
