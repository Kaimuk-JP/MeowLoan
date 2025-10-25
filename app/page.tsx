import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, Database, ArrowRight, CheckCircle, Star, Sparkles, BookOpen } from "lucide-react"
import { PageTransition } from "@/components/ui/page-transition"
import { OrganizationSchema, ServiceSchema, FAQSchema } from "@/components/structured-data"
import type { Metadata } from "next"
import { db } from "@/lib/firebase"
import { collection, getCountFromServer } from "firebase/firestore"

export const metadata: Metadata = {
  title: "บริการเก็บจิตอาสาออนไลน์ MeowLoan - บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์",
  description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ง่าย สะดวก รวดเร็ว รับรองผลงาน 100%",
  alternates: {
    canonical: "https://setstudentloan.vercel.app",
  },
}

async function getCustomerCount() {
  try {
    const paymentSlipsRef = collection(db, 'payment_slips')
    const paymentSlipsSnapshot = await getCountFromServer(paymentSlipsRef)
    const paymentSlipsCount = paymentSlipsSnapshot.data().count
    
    const paymentSlipsCamelRef = collection(db, 'paymentSlips')
    const paymentSlipsCamelSnapshot = await getCountFromServer(paymentSlipsCamelRef)
    const paymentSlipsCamelCount = paymentSlipsCamelSnapshot.data().count
    
    return paymentSlipsCount + paymentSlipsCamelCount
  } catch (error) {
    console.error('Error fetching customer count:', error)
    return 0
  }
}

export default async function Home() {
  const customerCount = await getCustomerCount()

  return (
    <PageTransition>
      <OrganizationSchema />
      <ServiceSchema />
      <FAQSchema />

      <div className="relative min-h-screen">
        {/* Hero Section with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-40 left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container relative mx-auto px-4 pt-24 pb-32">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-8 border border-white/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">บริการเชื่อถือได้ รวดเร็ว ปลอดภัย</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                MeowLoan
                <span className="block mt-2 text-3xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                  บริการจิตอาสาออนไลน์
                </span>
              </h1>
              
              <p className="mt-6 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                รับจ้างเก็บชั่วโมงจิตอาสาและกรอกข้อมูลลงระบบ 
                <span className="font-semibold text-white"> ง่าย สะดวก รวดเร็ว</span>
              </p>
              
              
              
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="rounded-full px-8 py-6 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  asChild
                >
                  <Link href="#services">
                    เริ่มต้นใช้บริการ <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
               
              </div>

              {/* Stats */}
              <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{customerCount.toLocaleString()}+</div>
                  <div className="text-blue-200">ลูกค้าที่ใช้บริการ</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">100%</div>
                  <div className="text-blue-200">รับรองผลงาน</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-200">พร้อมให้บริการ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" className="w-full h-auto">
              <path
                fill="#ffffff"
                d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Features Section - Redesigned */}
        <div className="container mx-auto px-4 py-20 -mt-16 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Info Banner */}
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">รองรับทุนการศึกษากยศและทุนเรียนดี</h3>
                  <p className="text-blue-50">
                    ✓ ทุน กยศ (กองทุนเงินให้กู้ยืมเพื่อการศึกษา)<br />
                    ✓ ทุนเรียนดี (ต้องสมัคร SET Member ก่อน)
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href="https://member.set.or.th/set-member/registration/profile-registration"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    สมัคร SET Member
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-blue-200">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">บริการรวดเร็ว</h3>
                <p className="text-gray-600 leading-relaxed">ดำเนินการทันทีหลังจากได้รับการชำระเงิน งานเสร็จภายใน 1-3 วัน</p>
              </div>

              <div className="group bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-teal-200">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">ทีมงานมืออาชีพ</h3>
                <p className="text-gray-600 leading-relaxed">ทีมงานที่มีประสบการณ์ พร้อมให้บริการอย่างมีคุณภาพตลอด 24 ชั่วโมง</p>
              </div>

              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-purple-200">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">ข้อมูลปลอดภัย</h3>
                <p className="text-gray-600 leading-relaxed">ข้อมูลของคุณจะถูกเก็บเป็นความลับและปลอดภัย 100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section - Redesigned */}
        <div id="services" className="container mx-auto px-4 py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 mb-4 font-medium">
                <Star className="h-4 w-4" />
                <span>บริการของเรา</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                เลือกแพ็คเกจที่เหมาะกับคุณ
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                บริการครบวงจร ราคาเป็นกันเอง รับรองคุณภาพ
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 - Hourly */}
              <Card className="relative border-2 border-gray-200 hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all overflow-hidden group transform hover:-translate-y-2">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">บริการรายชั่วโมง</CardTitle>
                  <CardDescription className="text-base">สำหรับผู้ที่ต้องการเก็บชั่วโมงจำนวนน้อย</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">฿8</span>
                      <span className="text-gray-500">/ ชั่วโมง</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">ดำเนินการภายใน 24 ชม.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">งานเสร็จ 1-3 วัน</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">รับรองผลงาน 100%</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <Link href="/register?type=hourly">
                      สั่งจองบริการ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 2 - Package (Featured) */}
              <Card className="relative border-2 border-teal-500 shadow-2xl hover:shadow-3xl transition-all overflow-hidden group transform scale-105 hover:scale-110">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl shadow-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  <span>แนะนำ</span>
                </div>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600"></div>
                <CardHeader className="pb-4 pt-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">แพ็คเกจ 36 ชั่วโมง</CardTitle>
                  <CardDescription className="text-base">ประหยัดกว่าเมื่อเทียบกับรายชั่วโมง</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-700">฿150</span>
                      <span className="text-gray-500">/ 36 ชม.</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      <span>ประหยัด 42%</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">ดำเนินการภายใน 24 ชม.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">งานเสร็จ 1-3 วัน</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">รับรองผลงาน 100%</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Link href="/register?type=package">
                      สั่งจองบริการ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 3 - System */}
              <Card className="relative border-2 border-gray-200 hover:border-purple-500 shadow-lg hover:shadow-2xl transition-all overflow-hidden group transform hover:-translate-y-2">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Database className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">บริการกรอกข้อมูล</CardTitle>
                  <CardDescription className="text-base">บริการกรอกข้อมูลลงระบบให้เรียบร้อย</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700">฿100</span>
                      <span className="text-gray-500">/ ครั้ง</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">กรอกข้อมูลครบถ้วน</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">ดำเนินการภายใน 24 ชม.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">รับรองผลงาน 100%</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <Link href="/register?type=system">
                      สั่งจองบริการ
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card 4 - Exams */}
              <Card className="relative border-2 border-gray-200 hover:border-orange-500 shadow-lg hover:shadow-2xl transition-all overflow-hidden group transform hover:-translate-y-2">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                <CardHeader className="pb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl">เฉลยข้อสอบ Examination</CardTitle>
                  <CardDescription className="text-base">เลือกซื้อข้อสอบเพื่อเตรียมตัวสอบ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-700">฿5</span>
                      <span className="text-gray-500">/ ชุด</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">ข้อสอบหลากหลายวิชา</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">เข้าถึงได้ทันที</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">คำอธิบายเฉลยละเอียด</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <Link href="/exams">
                      ดูข้อสอบทั้งหมด
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Contact Section - Redesigned */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  มีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  ทีมงานของเราพร้อมให้คำปรึกษาและตอบคำถามทุกข้อสงสัย
                </p>
                <Button
                  size="lg"
                  className="rounded-full px-10 py-7 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 font-semibold"
                  asChild
                >
                  <Link href="https://line.me/ti/p/6JSq5f9K0-" target="_blank" rel="noopener noreferrer">
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    ติดต่อเราทาง Line
                  </Link>
                </Button>
                <p className="mt-4 text-blue-200 text-sm">Line ID: MinOru21</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Redesigned */}
        <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">MeowLoan</h3>
                  <p className="text-gray-400">
                    บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ที่คุณไว้วางใจ
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">บริการของเรา</h4>
                  <ul className="space-y-2">
                    <li><Link href="/register?type=hourly" className="hover:text-blue-400 transition-colors">บริการรายชั่วโมง</Link></li>
                    <li><Link href="/register?type=package" className="hover:text-blue-400 transition-colors">แพ็คเกจ 36 ชั่วโมง</Link></li>
                    <li><Link href="/register?type=system" className="hover:text-blue-400 transition-colors">บริการกรอกข้อมูล</Link></li>
                    <li><Link href="/exams" className="hover:text-blue-400 transition-colors">ข้อสอบออนไลน์</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">ติดต่อเรา</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                      </svg>
                      <span>Line: MinOru21</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-8 text-center">
                <p className="text-gray-500">
                  © {new Date().getFullYear()} MeowLoan - บริการจิตอาสาออนไลน์. สงวนลิขสิทธิ์.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
