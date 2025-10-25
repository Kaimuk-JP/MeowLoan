import { db } from "./firebase"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  Timestamp,
  where,
  getDoc,
  setDoc,
  orderBy,
  deleteDoc,
} from "firebase/firestore"
import { uploadToCloudinary } from "./cloudinary"
import { notifyPaymentReceived, testDiscordWebhook } from "./discord-service"

// Types
export interface OrderData {
  id?: string
  userId: string
  fullName: string
  idNumber: string
  connectId: string
  studentId?: string
  phone: string
  notes?: string
  type: "hourly" | "package" | "system"
  hours: number
  includeSystem: boolean
  amount: number
  status: "pending" | "in_progress" | "completed"
  paymentSlipUrl?: string
  downloadUrl?: string // เพิ่มฟิลด์สำหรับ URL ดาวน์โหลด
  createdAt: Timestamp
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  phone: string
  role: "user" | "admin"
  createdAt: Date
}

export interface PaymentSlip {
  id: string
  imageUrl: string
  amount: number
  notes?: string
  orderId?: string
  createdAt: any
  uploadedByAdmin: boolean
}

// Create a new order
export async function createOrder(
  userId: string,
  orderData: Omit<OrderData, "id" | "userId" | "status" | "createdAt" | "paymentSlipUrl" | "downloadUrl">,
): Promise<string> {
  try {
    console.log("Creating new order for user:", userId, orderData)

    // Remove undefined values from orderData
    const cleanedData = Object.fromEntries(Object.entries(orderData).filter(([_, value]) => value !== undefined))

    const docRef = await addDoc(collection(db, "orders"), {
      ...cleanedData,
      userId,
      status: "pending",
      createdAt: Timestamp.now(),
    })

    console.log("Order created with ID:", docRef.id)

    // ไม่ส่งแจ้งเตือนไปยัง Discord ทันที (จะส่งหลังจากอัพโหลดสลิปเงิน)

    return docRef.id
  } catch (error) {
    console.error("Error adding order:", error)
    throw error
  }
}

// สร้างคำสั่งซื้อและอัพโหลดสลิปพร้อมกัน
export async function createOrderWithSlip(
  orderData: Omit<OrderData, "id" | "status" | "createdAt" | "paymentSlipUrl" | "downloadUrl">,
  slipFile: File,
): Promise<string> {
  try {
    console.log("Creating new order with payment slip for user:", orderData.userId)

    // อัพโหลดสลิปไปยัง Cloudinary ก่อน
    console.log("Uploading payment slip to Cloudinary...")
    const imageUrl = await uploadToCloudinary(slipFile)
    console.log("Payment slip uploaded successfully, URL:", imageUrl)

    // Remove undefined values from orderData
    const cleanedData = Object.fromEntries(Object.entries(orderData).filter(([_, value]) => value !== undefined))

    // สร้างคำสั่งซื้อพร้อมกับ URL ของสลิป
    const docRef = await addDoc(collection(db, "orders"), {
      ...cleanedData,
      status: "pending",
      paymentSlipUrl: imageUrl,
      createdAt: Timestamp.now(),
    })

    const orderId = docRef.id
    console.log("Order created with ID:", orderId)

    // เพิ่มบันทึกลงในคอลเลคชัน payment_slips
    await addDoc(collection(db, "payment_slips"), {
      imageUrl: imageUrl,
      amount: orderData.amount,
      orderId: orderId,
      createdAt: Timestamp.now(),
      uploadedByAdmin: false,
    })
    console.log("Payment slip record created")

    // ส่งแจ้งเตือนไปยัง Discord
    try {
      const orderTypeText = getOrderTypeText(orderData.type)
      await notifyPaymentReceived(orderId, orderTypeText, orderData.fullName, orderData.amount, imageUrl)
      console.log("Discord notification sent successfully")
    } catch (notificationError) {
      console.error("Failed to send Discord notification, but order was created successfully:", notificationError)
      // ไม่ throw error เพื่อให้การสร้างคำสั่งซื้อยังทำงานได้
    }

    return orderId
  } catch (error) {
    console.error("Error creating order with payment slip:", error)
    throw error
  }
}

// Helper function to get order type text
function getOrderTypeText(type: string): string {
  switch (type) {
    case "hourly":
      return "บริการรายชั่วโมง"
    case "package":
      return "แพ็คเกจ 36 ชั่วโมง"
    case "system":
      return "บริการกรอกข้อมูลลงระบบ"
    default:
      return type
  }
}

// Update an existing order
export async function updateOrder(orderId: string, orderData: Partial<OrderData>): Promise<void> {
  try {
    console.log("Updating order:", orderId, orderData)

    // Get the order reference
    const orderRef = doc(db, "orders", orderId)

    // Check if order exists
    const orderDoc = await getDoc(orderRef)
    if (!orderDoc.exists()) {
      throw new Error("Order not found")
    }

    // Check if order is already completed
    const existingOrderData = orderDoc.data() as OrderData
    if (existingOrderData.status === "completed" && !orderData.downloadUrl) {
      throw new Error("Cannot update a completed order")
    }

    // Update the order
    await updateDoc(orderRef, {
      ...orderData,
      updatedAt: Timestamp.now(),
    })

    console.log("Order updated successfully")
  } catch (error) {
    console.error("Error updating order:", error)
    throw error
  }
}

// Update order download URL
export async function updateOrderDownloadUrl(orderId: string, downloadUrl: string): Promise<void> {
  try {
    console.log("Updating order download URL:", orderId, downloadUrl)

    // Get the order reference
    const orderRef = doc(db, "orders", orderId)

    // Check if order exists
    const orderDoc = await getDoc(orderRef)
    if (!orderDoc.exists()) {
      throw new Error("Order not found")
    }

    // Update the order with download URL
    await updateDoc(orderRef, {
      downloadUrl: downloadUrl,
      updatedAt: Timestamp.now(),
    })

    console.log("Order download URL updated successfully")
  } catch (error) {
    console.error("Error updating order download URL:", error)
    throw error
  }
}

// Upload payment slip and update order
export async function uploadPaymentSlip(orderId: string, file: File): Promise<void> {
  try {
    console.log("Starting payment slip upload for order:", orderId)

    // First check if the order exists
    const orderRef = doc(db, "orders", orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      console.error("Order not found:", orderId)
      throw new Error("Order not found")
    }

    console.log("Order found, proceeding with upload")

    // Upload to Cloudinary
    console.log("Uploading image...")
    const imageUrl = await uploadToCloudinary(file)
    console.log("Upload successful, image URL obtained")

    // Update order with payment slip URL
    await updateDoc(orderRef, {
      paymentSlipUrl: imageUrl,
    })
    console.log("Order updated with payment slip URL")

    // เพิ่มบันทึกลงในคอลเลคชัน payment_slips
    const orderData = orderSnap.data() as OrderData
    await addDoc(collection(db, "payment_slips"), {
      imageUrl: imageUrl,
      amount: orderData.amount,
      orderId: orderId,
      createdAt: Timestamp.now(),
      uploadedByAdmin: false,
    })

    // ส่งแจ้งเตือนไปยัง Discord หลังจากอัพโหลดสลิป
    try {
      const orderTypeText = getOrderTypeText(orderData.type)

      // ส่งการแจ้งเตือนโดยตรง
      await notifyPaymentReceived(orderId, orderTypeText, orderData.fullName, orderData.amount, imageUrl)
      console.log("Discord notification sent successfully")
    } catch (notificationError) {
      console.error(
        "Failed to send Discord notification, but payment slip was uploaded successfully:",
        notificationError,
      )
      // ไม่ throw error เพื่อให้การอัพโหลดสลิปยังทำงานได้
    }
  } catch (error) {
    console.error("Error in uploadPaymentSlip:", error)
    throw error
  }
}

// อัพโหลดสลิปโดยแอดมิน (ไม่เชื่อมโยงกับคำสั่งซื้อ)
export async function uploadAdminPaymentSlip(file: File): Promise<string> {
  try {
    console.log("Starting admin payment slip upload")

    // Upload to Cloudinary
    console.log("Uploading image...")
    const imageUrl = await uploadToCloudinary(file)
    console.log("Upload successful, image URL obtained")

    // บันทึกลงในคอลเลคชัน payment_slips
    const slipRef = await addDoc(collection(db, "payment_slips"), {
      imageUrl: imageUrl,
      amount: 0, // ใส่ค่าเริ่มต้นเป็น 0
      createdAt: Timestamp.now(),
      uploadedByAdmin: true,
    })

    console.log("Admin payment slip saved with ID:", slipRef.id)
    return slipRef.id
  } catch (error) {
    console.error("Error in uploadAdminPaymentSlip:", error)
    throw error
  }
}

// ดึงข้อมูลสลิปการชำระเงินทั้งหมด
export async function getAllPaymentSlips(): Promise<PaymentSlip[]> {
  try {
    console.log("Fetching all payment slips")

    // ใช้ orderBy โดยไม่มี where เพื่อไม่ต้องใช้ composite index
    const q = query(collection(db, "payment_slips"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const slips = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PaymentSlip,
    )

    console.log(`Retrieved ${slips.length} payment slips`)
    return slips
  } catch (error) {
    console.error("Error getting payment slips:", error)
    throw error
  }
}

// เพิ่มฟังก์ชันสำหรับลบสลิปการชำระเงิน
export async function deletePaymentSlip(slipId: string): Promise<void> {
  try {
    console.log(`Deleting payment slip with ID: ${slipId}`)

    // ตรวจสอบว่าสลิปมีอยู่จริง
    const slipRef = doc(db, "payment_slips", slipId)
    const slipDoc = await getDoc(slipRef)

    if (!slipDoc.exists()) {
      throw new Error("Payment slip not found")
    }

    // ลบสลิปจาก Firestore
    await deleteDoc(slipRef)
    console.log("Payment slip deleted successfully")
  } catch (error) {
    console.error("Error deleting payment slip:", error)
    throw error
  }
}

// แก้ไขฟังก์ชัน getOrders เพื่อหลีกเลี่ยงการใช้ composite index
export async function getOrders(): Promise<OrderData[]> {
  try {
    console.log("Fetching all orders")

    // ใช้ query โดยไม่มี orderBy เพื่อหลีกเลี่ยงการใช้ composite index
    const q = query(collection(db, "orders"))
    const querySnapshot = await getDocs(q)

    const orders = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderData,
    )

    // เรียงลำดับข้อมูลในหน่วยความจำแทน (client-side sorting)
    const sortedOrders = orders.sort((a, b) => {
      // ตรวจสอบว่า createdAt เป็น Timestamp หรือไม่
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt

      // เรียงจากใหม่ไปเก่า (descending)
      return dateB - dateA
    })

    console.log(`Retrieved ${sortedOrders.length} orders`)
    return sortedOrders
  } catch (error) {
    console.error("Error getting orders:", error)
    throw error
  }
}

// แก้ไขฟังก์ชัน getOrdersByStatus เพื่อหลีกเลี่ยงการใช้ composite index
export async function getOrdersByStatus(status: "pending" | "completed"): Promise<OrderData[]> {
  try {
    console.log(`Fetching orders with status: ${status}`)

    // ใช้เฉพาะ where clause โดยไม่มี orderBy เพื่อหลีกเลี่ยงการใช้ composite index
    const q = query(collection(db, "orders"), where("status", "==", status))
    const querySnapshot = await getDocs(q)

    // ดึงข้อมูลจาก Firestore
    const orders = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderData,
    )

    // เรียงลำดับข้อมูลในหน่วยความจำแทน (client-side sorting)
    const sortedOrders = orders.sort((a, b) => {
      // ตรวจสอบว่า createdAt เป็น Timestamp หรือไม่
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt

      // เรียงจากใหม่ไปเก่า (descending)
      return dateB - dateA
    })

    console.log(`Retrieved ${sortedOrders.length} orders with status: ${status}`)
    return sortedOrders
  } catch (error) {
    console.error("Error getting orders by status:", error)
    throw error
  }
}

// Get orders by user ID - แก้ไขเพื่อหลีกเลี่ยงการใช้ composite index
export async function getOrdersByUserId(userId: string): Promise<OrderData[]> {
  try {
    console.log(`Fetching orders for user: ${userId}`)

    // ใช้เฉพาะ where clause โดยไม่มี orderBy เพื่อหลีกเลี่ยงการใช้ composite index
    const q = query(collection(db, "orders"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)

    // ดึงข้อมูลจาก Firestore
    const orders = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as OrderData,
    )

    // เรียงลำดับข้อมูลในหน่วยความจำแทน (client-side sorting)
    const sortedOrders = orders.sort((a, b) => {
      // ตรวจสอบว่า createdAt เป็น Timestamp หรือไม่
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt

      // เรียงจากใหม่ไปเก่า (descending)
      return dateB - dateA
    })

    console.log(`Retrieved ${sortedOrders.length} orders for user: ${userId}`)
    return sortedOrders
  } catch (error) {
    console.error("Error getting orders by user ID:", error)
    throw error
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<OrderData | null> {
  try {
    console.log(`Fetching order with ID: ${orderId}`)
    const orderDoc = await getDoc(doc(db, "orders", orderId))

    if (orderDoc.exists()) {
      const orderData = {
        id: orderDoc.id,
        ...orderDoc.data(),
      } as OrderData

      console.log("Order retrieved successfully:", orderData)
      return orderData
    }

    console.log("Order not found")
    return null
  } catch (error) {
    console.error("Error getting order by ID:", error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "in_progress" | "completed",
): Promise<void> {
  try {
    console.log(`Updating order ${orderId} status to ${status}`)
    const orderRef = doc(db, "orders", orderId)
    await updateDoc(orderRef, { status })
    console.log("Order status updated successfully")
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Delete order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    console.log(`Deleting order with ID: ${orderId}`)
    const orderRef = doc(db, "orders", orderId)

    // Check if order exists
    const orderDoc = await getDoc(orderRef)
    if (!orderDoc.exists()) {
      throw new Error("Order not found")
    }

    // Delete the order
    await deleteDoc(orderRef)
    console.log("Order deleted successfully")
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

// Create or update user profile
export async function updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
  try {
    console.log("Updating user profile:", uid, profileData)
    const userRef = doc(db, "users", uid)

    // Check if document exists
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      // Update existing document
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date(),
      })
      console.log("User profile updated in database:", uid)
    } else {
      // Create new document
      await setDoc(userRef, {
        uid,
        ...profileData,
        createdAt: new Date(),
      })
      console.log("User profile created in database:", uid)
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// ฟังก์ชันสำหรับทดสอบการส่งข้อความไปยัง Discord
export async function testDiscordNotification(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    const result = await testDiscordWebhook()

    if (result.success) {
      return {
        success: true,
        message: "การทดสอบการแจ้งเตือน Discord สำเร็จ",
        details: result,
      }
    } else {
      return {
        success: false,
        message: "การทดสอบการแจ้งเตือน Discord ล้มเหลว",
        details: result,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการทดสอบการแจ้งเตือน Discord",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}
