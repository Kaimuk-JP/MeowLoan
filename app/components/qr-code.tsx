"use client"

import { useEffect, useState } from "react"

interface QRCodeProps {
  amount: number
  recipientName: string
  recipientId: string
  promptPayNumber?: string
}

export default function QRCode({ amount, recipientName, recipientId, promptPayNumber }: QRCodeProps) {
  const [isClient, setIsClient] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)

    // สร้าง QR Code สำหรับพร้อมเพย์
    if (promptPayNumber) {
      // ในสถานการณ์จริง คุณควรใช้ API เพื่อสร้าง QR Code
      // แต่สำหรับตัวอย่างนี้ เราจะใช้ promptpay.io API
      const encodedAmount = encodeURIComponent(amount.toString())
      const encodedPhone = encodeURIComponent(promptPayNumber)
      setQrUrl(`https://promptpay.io/${encodedPhone}/${encodedAmount}`)
    }
  }, [amount, promptPayNumber])

  if (!isClient) {
    return (
      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">กำลังโหลด QR Code...</p>
      </div>
    )
  }

  // ถ้ามี QR URL จาก API ให้แสดงรูปจาก URL นั้น
  if (qrUrl) {
    return (
      <div className="relative">
        <div className="w-64 h-64 bg-white flex items-center justify-center border border-gray-200 rounded-lg">
          <img src={qrUrl || "/placeholder.svg"} alt="พร้อมเพย์ QR Code" className="w-full h-full p-2" />
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center text-xs bg-white bg-opacity-80 py-1"></div>
      </div>
    )
  }

  // QR Code แบบจำลอง (fallback)
  return (
    <div className="relative">
      <div className="w-64 h-64 bg-white flex items-center justify-center border border-gray-200 rounded-lg">
        <svg
          viewBox="0 0 200 200"
          width="200"
          height="200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simple QR code pattern for demonstration */}
          <rect x="0" y="0" width="200" height="200" fill="white" />
          <rect x="10" y="10" width="40" height="40" fill="black" />
          <rect x="150" y="10" width="40" height="40" fill="black" />
          <rect x="10" y="150" width="40" height="40" fill="black" />
          <rect x="60" y="60" width="80" height="80" fill="black" />
          <rect x="70" y="70" width="60" height="60" fill="white" />
          <rect x="80" y="80" width="40" height="40" fill="black" />
          <rect x="90" y="90" width="20" height="20" fill="white" />

          {/* Additional patterns */}
          <rect x="10" y="60" width="10" height="80" fill="black" />
          <rect x="30" y="60" width="10" height="80" fill="black" />
          <rect x="50" y="10" width="10" height="40" fill="black" />
          <rect x="70" y="10" width="10" height="40" fill="black" />
          <rect x="90" y="10" width="10" height="40" fill="black" />
          <rect x="110" y="10" width="10" height="40" fill="black" />
          <rect x="130" y="10" width="10" height="40" fill="black" />
          <rect x="150" y="60" width="10" height="80" fill="black" />
          <rect x="170" y="60" width="10" height="80" fill="black" />
          <rect x="50" y="150" width="10" height="40" fill="black" />
          <rect x="70" y="150" width="10" height="40" fill="black" />
          <rect x="90" y="150" width="10" height="40" fill="black" />
          <rect x="110" y="150" width="10" height="40" fill="black" />
          <rect x="130" y="150" width="10" height="40" fill="black" />
        </svg>
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs bg-white bg-opacity-80 py-1">
        <div>{amount} บาท</div>
        <div>{recipientName}</div>
      </div>
    </div>
  )
}
