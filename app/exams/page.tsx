'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { getActiveExams, type Exam } from '@/lib/exam-service'
import { BookOpen, Clock, FileQuestion, ShoppingCart, Search, CheckCircle, AlertCircle, X } from 'lucide-react'
import { PageTransition } from '@/components/ui/page-transition'
import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ExamOrderStatus {
  examId: string
  status: 'pending' | 'completed'
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [userExamOrders, setUserExamOrders] = useState<ExamOrderStatus[]>([])
  const [previewExam, setPreviewExam] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // ป้องกันการแคปหน้าจอ
  useEffect(() => {
    // ป้องกัน Screenshot และ Screen Recording
    const preventScreenCapture = () => {
      // เพิ่ม overlay ที่ทำให้รูปแคปเป็นสีดำ
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
          background: rgba(0, 0, 0, 0.01);
        `
        document.body.appendChild(overlay)
        return overlay
      }

      const overlay = createProtectionOverlay()

      // ป้องกัน Print Screen
      document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
          navigator.clipboard.writeText('')
          toast.error('⚠️ ห้ามแคปหน้าจอ!')
        }
      })

      // ป้องกัน Screenshot shortcuts
      document.addEventListener('keydown', (e) => {
        // Windows: Win+Shift+S, Win+PrtScn
        // Mac: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
        if (
          (e.key === 'PrintScreen') ||
          (e.shiftKey && e.metaKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
          (e.shiftKey && e.metaKey && e.key === 's')
        ) {
          e.preventDefault()
          // ทำให้หน้าจอกะพริบดำชั่วขณะ
          document.body.style.filter = 'brightness(0)'
          setTimeout(() => {
            document.body.style.filter = ''
          }, 100)
          toast.error('⚠️ ห้ามแคปหน้าจอ!')
        }
      })

      // ป้องกัน context menu (right click)
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        toast.warning('⚠️ ปิดการใช้งานคลิกขวา')
      })

      // ป้องกัน Developer Tools
      document.addEventListener('keydown', (e) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault()
          toast.error('⚠️ ห้ามเปิด Developer Tools')
        }
      })

      // ตรวจจับ visibility change (บ่งบอกว่าอาจกำลังบันทึกหน้าจอ)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // ทำให้หน้าจอดำเมื่อสลับ tab (ป้องกัน screen recording)
          document.body.style.filter = 'brightness(0) blur(20px)'
          console.warn('⚠️ หน้าจอถูกซ่อน - อาจกำลังบันทึกหน้าจอ')
        } else {
          // คืนค่าเมื่อกลับมา
          document.body.style.filter = ''
        }
      })

      // เพิ่ม CSS เพื่อป้องกัน selection และทำให้รูปดำเมื่อแคป
      const style = document.createElement('style')
      style.textContent = `
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        input, textarea {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* ป้องกันการแคปรูปภาพ */
        img {
          pointer-events: none;
          -webkit-user-drag: none;
          user-drag: none;
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* เมื่อมีการ screenshot จะทำให้เนื้อหาดำ */
        @media print {
          body {
            filter: brightness(0) !important;
          }
        }
      `
      document.head.appendChild(style)

      return () => {
        // Cleanup
        if (style && style.parentNode) {
          style.parentNode.removeChild(style)
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay)
        }
      }
    }

    const cleanup = preventScreenCapture()

    return cleanup
  }, [])

  useEffect(() => {
    loadExams()
    if (user) {
      loadUserExamOrders()
    }
  }, [user])

  const loadExams = async () => {
    try {
      setLoading(true)
      const data = await getActiveExams()
      console.log('📚 ข้อมูลข้อสอบที่ได้จาก Firebase:', data)
      console.log('📊 จำนวนข้อสอบ:', data.length)
      setExams(data)
    } catch (error) {
      console.error('❌ Error loading exams:', error)
      toast.error('ไม่สามารถโหลดข้อมูลข้อสอบได้')
    } finally {
      setLoading(false)
    }
  }

  const loadUserExamOrders = async () => {
    if (!user) return
    
    try {
      const ordersRef = collection(db, 'examOrders')
      const q = query(ordersRef, where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      
      const orders: ExamOrderStatus[] = snapshot.docs.map(doc => ({
        examId: doc.data().examId,
        status: doc.data().status
      }))
      
      setUserExamOrders(orders)
      console.log('📦 User exam orders:', orders)
    } catch (error) {
      console.error('Error loading user exam orders:', error)
    }
  }

  const getExamStatus = (examId: string): 'none' | 'pending' | 'completed' => {
    const order = userExamOrders.find(o => o.examId === examId)
    return order ? order.status : 'none'
  }

  const handleBuyExam = (examId: string) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนซื้อข้อสอบ')
      router.push('/login')
      return
    }

    const status = getExamStatus(examId)
    
    if (status === 'completed') {
      router.push(`/exams/${examId}/view`)
      return
    }
    
    if (status === 'pending') {
      toast.info('คุณได้ทำการสั่งซื้อข้อสอบนี้แล้ว กรุณารอการอนุมัติ')
      return
    }
    
    router.push(`/exams/${examId}/purchase`)
  }

  const loadExamPreview = async (examId: string) => {
    setLoadingPreview(true)
    try {
      const { doc, getDoc } = await import('firebase/firestore')
      const examRef = doc(db, 'exams', examId)
      const examSnap = await getDoc(examRef)
      
      if (examSnap.exists()) {
        const examData = examSnap.data()
        // ดึงข้อสอบ 10 ข้อแรก
        const preview = {
          id: examId,
          title: examData.title,
          questions: examData.questions?.slice(0, 10) || []
        }
        setPreviewExam(preview)
      } else {
        toast.error('ไม่พบข้อมูลข้อสอบ')
      }
    } catch (error) {
      console.error('Error loading exam preview:', error)
      toast.error('ไม่สามารถโหลดตัวอย่างข้อสอบได้')
    } finally {
      setLoadingPreview(false)
    }
  }

  const subjects = ['all', ...new Set(exams.map(exam => exam.subject))]
  
  // กรองตาม subject และ search query
  const filteredExams = exams.filter(exam => {
    const matchSubject = selectedSubject === 'all' || exam.subject === selectedSubject
    const matchSearch = searchQuery === '' || 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchSubject && matchSearch
  })

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              เฉลยข้อสอบ
            </h1>
            <p className="text-lg text-gray-600">
              เลือกซื้อข้อสอบที่ต้องการ
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ค้นหาข้อสอบ... (ชื่อวิชา, รหัสวิชา)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

         

          {/* Exams Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">ยังไม่มีข้อสอบในหมวดหมู่นี้</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredExams.map((exam) => {
                const status = getExamStatus(exam.id)
                
                return (
                  <Card key={exam.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    {exam.imageUrl && (
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                        <img
                          src={exam.imageUrl}
                          alt={exam.title}
                          className="w-full h-full object-cover"
                        />
                        {status !== 'none' && (
                          <div className="absolute top-2 right-2">
                            {status === 'completed' ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                ซื้อแล้ว
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-500 text-white">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                รอดำเนินการ
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {!exam.imageUrl && (
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-blue-500" />
                        {status !== 'none' && (
                          <div className="absolute top-2 right-2">
                            {status === 'completed' ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                ซื้อแล้ว
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-500 text-white">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                รอดำเนินการ
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{exam.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <div className="space-y-2">
                       
                        
                        <div className="pt-2 border-t">
                          <div className="text-2xl font-bold text-blue-600">
                            ฿{exam.price}
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                      {status === 'completed' ? (
                        <Button 
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          onClick={() => router.push(`/exams/${exam.id}/view`)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          เข้าสู่ข้อสอบ
                        </Button>
                      ) : status === 'pending' ? (
                        <Button 
                          className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                          onClick={() => toast.info('คุณได้ทำการสั่งซื้อข้อสอบนี้แล้ว กรุณารอการอนุมัติ')}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          รอดำเนินการ
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={() => handleBuyExam(exam.id)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          ซื้อข้อสอบ
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                        onClick={() => loadExamPreview(exam.id)}
                        disabled={loadingPreview}
                      >
                        <FileQuestion className="h-4 w-4 mr-2" />
                        ดูตัวอย่างเฉลยข้อสอบ
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog แสดงตัวอย่างข้อสอบ */}
      {previewExam && (
        <Dialog open={!!previewExam} onOpenChange={() => setPreviewExam(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <FileQuestion className="h-6 w-6 text-blue-600" />
                ตัวอย่างข้อสอบ 10 ข้อ
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">{previewExam.title}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {previewExam.questions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ไม่มีข้อสอบในชุดนี้</p>
                </div>
              ) : (
                <>
                  {/* แบนเนอร์แจ้งเตือน */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-start gap-3">
                      <FileQuestion className="h-6 w-6 shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg mb-1">นี่คือตัวอย่างข้อสอบ 10 ข้อแรก</h3>
                        <p className="text-sm text-blue-100">
                          เมื่อซื้อข้อสอบชุดนี้แล้ว คุณจะได้รับ:
                        </p>
                        <ul className="text-sm text-blue-100 mt-2 space-y-1 ml-4">
                          <li>✓ ข้อสอบครบทั้งชุด</li>
                          <li>✓ เฉลยพร้อมคำอธิบาย</li>
                          <li>✓ ทำข้อสอบได้ไม่จำกัดครั้ง</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {previewExam.questions.map((question: any, index: number) => (
                    <Card key={index} className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {/* คำถาม */}
                          <div>
                            

                            {/* รูปภาพคำถาม */}
                            {question.imageUrl && (
                              <div className="my-4 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                <img 
                                  src={question.imageUrl} 
                                  alt={`คำถามข้อ ${index + 1}`}
                                  className="w-full h-auto max-h-80 object-contain"
                                />
                              </div>
                            )}
                          </div>

                          {/* ตัวเลือก */}
                          <div className="space-y-3 pl-0 sm:pl-2">
                            {question.options?.map((option: string, optIndex: number) => {
                              const optionLabel = ['ก', 'ข', 'ค', 'ง'][optIndex]
                              const isCorrect = question.correctAnswer === optionLabel
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-4 rounded-lg border-2 transition-all ${
                                    isCorrect 
                                      ? 'border-green-500 bg-green-50 shadow-md' 
                                      : 'border-gray-200 bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`font-bold shrink-0 text-lg ${isCorrect ? 'text-green-700' : 'text-gray-600'}`}>
                                      {optionLabel}.
                                    </span>
                                    <span className={`text-sm sm:text-base flex-1 break-words leading-relaxed ${
                                      isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'
                                    }`}>
                                      {option}
                                    </span>
                                    {isCorrect && (
                                      <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* เฉลย */}
                          <div className="mt-6 pt-4 border-t-2 border-gray-200">
                            <div className="flex items-start gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-md">
                              <CheckCircle className="h-6 w-6 shrink-0 mt-1" />
                              <div className="flex-1">
                                <span className="text-sm font-bold block mb-1">เฉลยคำตอบ</span>
                                <span className="text-base">
                                  ตัวเลือก <span className="font-bold text-lg">{question.correctAnswer}</span>
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
                  ))}

                  {/* ปุ่มซื้อด้านล่าง */}
                  <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                      <div className="text-center sm:text-left">
                        <p className="text-sm text-gray-600">ชอบข้อสอบชุดนี้?</p>
                        <p className="text-lg font-bold text-blue-600">ซื้อเลยเพื่อเข้าถึงข้อสอบทั้งหมด!</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => {
                            setPreviewExam(null)
                            handleBuyExam(previewExam.id)
                          }}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          ซื้อข้อสอบนี้
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setPreviewExam(null)}
                          className="sm:w-auto"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageTransition>
  )
}
