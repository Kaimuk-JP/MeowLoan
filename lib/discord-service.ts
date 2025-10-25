// Discord webhook URL - ในสภาพแวดล้อมจริงควรเก็บใน environment variables
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1360492032560201889/msDhmlMjT0HgEj47H85xwbVRJ_7pNuXFk7F5u40oKA92xMOhLVLrBDhv4FkQpmovcAPK"

// ฟังก์ชันสำหรับส่งข้อความแจ้งเตือนไปยัง Discord Webhook
export async function sendDiscordNotification(
  message: string,
  title: string,
  fields?: { name: string; value: string; inline?: boolean }[],
  imageUrl?: string,
) {
  try {
    // สร้าง payload แบบง่ายที่สุด
    const payload: any = {
      content: null,
      embeds: [
        {
          title: title,
          description: message,
          color: 3447003, // สีฟ้า
          fields: fields || [],
        },
      ],
    }

    // เพิ่ม image ถ้ามี และตรวจสอบว่า URL เป็นรูปแบบที่ถูกต้อง
    if (imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      payload.embeds[0].image = {
        url: imageUrl,
      }
    }

    console.log("Sending Discord notification with payload:", JSON.stringify(payload))

    // ส่งข้อมูลไปยัง Discord Webhook
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    // ตรวจสอบสถานะการตอบกลับ
    if (response.ok) {
      console.log("Discord notification sent successfully")
      return true
    } else {
      const responseText = await response.text()
      console.error(`Discord notification failed: ${response.status} ${responseText}`)
      return false
    }
  } catch (error) {
    console.error("Error in Discord notification function:", error)
    return false
  }
}

// ฟังก์ชันสำหรับส่งแจ้งเตือนเมื่อมีการชำระเงิน
export async function notifyPaymentReceived(
  orderId: string,
  orderType: string,
  customerName: string,
  amount: number,
  paymentSlipUrl: string,
) {
  try {
    const title = "💰 มีการชำระเงิน!"
    const message = `ได้รับการชำระเงินสำหรับคำสั่งซื้อ #${orderId.substring(0, 8)}`

    const fields = [
      {
        name: "ชื่อลูกค้า",
        value: customerName,
        inline: true,
      },
      {
        name: "ประเภทบริการ",
        value: orderType,
        inline: true,
      },
      {
        name: "จำนวนเงิน",
        value: `${amount} บาท`,
        inline: true,
      },
      {
        name: "เวลา",
        value: new Date().toLocaleString("th-TH"),
        inline: false,
      },
    ]

    return sendDiscordNotification(message, title, fields, paymentSlipUrl)
  } catch (error) {
    console.error("Error in notifyPaymentReceived:", error)
    return false
  }
}

// ฟังก์ชันสำหรับส่งแจ้งเตือนเมื่อมีการซื้อข้อสอบ
export async function notifyExamPurchase(
  examTitle: string,
  customerName: string,
  amount: number,
  paymentSlipUrl: string,
) {
  try {
    const title = "📚 มีการสั่งซื้อข้อสอบ!"
    const message = `ได้รับคำสั่งซื้อข้อสอบใหม่`

    const fields = [
      {
        name: "ชื่อข้อสอบ",
        value: examTitle,
        inline: false,
      },
      {
        name: "ชื่อลูกค้า",
        value: customerName,
        inline: true,
      },
      {
        name: "จำนวนเงิน",
        value: `${amount} บาท`,
        inline: true,
      },
      {
        name: "เวลา",
        value: new Date().toLocaleString("th-TH"),
        inline: false,
      },
    ]

    return sendDiscordNotification(message, title, fields, paymentSlipUrl)
  } catch (error) {
    console.error("Error in notifyExamPurchase:", error)
    return false
  }
}

// ฟังก์ชันสำหรับทดสอบการส่งข้อความไปยัง Discord
export async function testDiscordWebhook() {
  try {
    // ใช้ payload แบบง่ายที่สุด
    const testPayload = {
      content: "🧪 นี่คือข้อความทดสอบจากระบบจิตอาสาออนไลน์",
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    // ตรวจสอบสถานะการตอบกลับ
    if (response.ok) {
      console.log("Discord webhook test successful")
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
      }
    } else {
      const responseText = await response.text()
      console.error(`Discord webhook test failed: ${response.status} ${responseText}`)
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        responseText: responseText,
      }
    }
  } catch (error) {
    console.error("Error testing Discord webhook:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
