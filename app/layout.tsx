import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { AutoLogoutWarning } from "@/components/auth/auto-logout-warning"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://setstudentloan.vercel.app"),
  title: {
    default: "บริการเก็บจิตอาสาออนไลน์ SETStudentLoan",
    template: "%s | SETStudentLoan",
  },
  description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ง่าย สะดวก รวดเร็ว รับรองผลงาน 100%",
  keywords: [
    "จิตอาสา",
    "กยศ",
    "กองทุนเงินให้กู้ยืมเพื่อการศึกษา",
    "เก็บชั่วโมงจิตอาสา",
    "กรอกข้อมูลกยศ",
    "บริการจิตอาสา",
    "ชั่วโมงจิตอาสา",
    "กยศคอนเน็ค",
  ],
  authors: [{ name: "SETStudentLoan", url: "https://setstudentloan.vercel.app" }],
  creator: "SETStudentLoan",
  publisher: "SETStudentLoan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://setstudentloan.vercel.app",
    title: "บริการเก็บจิตอาสาออนไลน์ SETStudentLoan",
    description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ง่าย สะดวก รวดเร็ว",
    siteName: "SETStudentLoan",
    images: [
      {
        url: "https://setstudentloan.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SETStudentLoan - บริการเก็บจิตอาสาออนไลน์",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "บริการเก็บจิตอาสาออนไลน์ SETStudentLoan",
    description: "บริการรับจ้างเก็บชั่วโมงจิตอาสาออนไลน์และกรอกข้อมูลลงระบบ ง่าย สะดวก รวดเร็ว",
    images: ["https://setstudentloan.vercel.app/og-image.jpg"],
  },
  alternates: {
    canonical: "https://setstudentloan.vercel.app",
  },
  generator: "Next.js",
  applicationName: "SETStudentLoan",
  referrer: "origin-when-cross-origin",
  category: "education",
  verification: {
    google: "FFLPHNC4ffnoYLqABU6FLzVTfWiseaWZcf82P-JrK-E",
  },
  other: {
    "google-site-verification": "FFLPHNC4ffnoYLqABU6FLzVTfWiseaWZcf82P-JrK-E",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="FFLPHNC4ffnoYLqABU6FLzVTfWiseaWZcf82P-JrK-E" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <AutoLogoutWarning />
              </div>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
