import { NextResponse } from "next/server"
import { testDiscordNotification } from "@/lib/db-service"

export async function GET() {
  try {
    const result = await testDiscordNotification()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error testing Discord notification:", error)

    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการทดสอบการแจ้งเตือน Discord",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
