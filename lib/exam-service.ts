import { db } from './firebase'
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore'

export interface Exam {
  id: string
  title: string
  name?: string // เพิ่ม name field สำหรับข้อมูลจริงใน Firebase
  description: string
  price: number
  subject: string
  level: string
  duration: number // in minutes
  questionCount: number
  questions?: any[] // เพิ่ม questions array
  imageUrl?: string
  image?: string // เพิ่ม image field อีกแบบ
  isActive: boolean
  createdAt: any
}

export interface ExamOrder {
  id?: string
  userId: string
  examId: string
  examTitle: string
  amount: number
  status: 'pending' | 'paid' | 'completed'
  paymentSlipUrl?: string
  purchaseDate: any
}

// Get all active exams
export async function getActiveExams(): Promise<Exam[]> {
  try {
    const examsRef = collection(db, 'exams')
    // ดึงทั้งหมดไม่กรอง isActive เพราะข้อมูลใน Firebase อาจไม่มี field นี้
    const snapshot = await getDocs(examsRef)
    
    
    const exams = snapshot.docs.map(doc => {
      const data = doc.data()
      
      
      // คำนวณจำนวนข้อจาก questions array
      const questionCount = data.questions?.length || data.questionCount || 0
      // ราคาคงที่ 5 บาท ทุกชุด
      const fixedPrice = 5
      
      return {
        id: doc.id,
        title: data.name || data.title || 'ไม่มีชื่อ',
        description: data.description || 'ไม่มีรายละเอียด',
        price: fixedPrice, // ราคาคงที่ 5 บาท
        subject: data.subject || 'ทั่วไป',
        level: data.level || 'ทั่วไป',
        duration: data.duration || 60,
        questionCount: questionCount,
        imageUrl: data.imageUrl || data.image || '',
        isActive: data.isActive !== false, // ถ้าไม่มี field นี้ก็ถือว่า active
        createdAt: data.createdAt
      }
    }) as Exam[]
    
    
    // เรียงข้อมูลใน JavaScript
    return exams.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA // เรียงจากใหม่ไปเก่า
    })
  } catch (error) {
    return []
  }
}

// Get exam by ID
export async function getExamById(examId: string): Promise<Exam | null> {
  try {
    const examRef = doc(db, 'exams', examId)
    const examSnap = await getDoc(examRef)
    
    if (examSnap.exists()) {
      const data = examSnap.data()
      
      // คำนวณจำนวนข้อจาก questions array
      const questionCount = data.questions?.length || data.questionCount || 0
      // ราคาคงที่ 5 บาท ทุกชุด
      const fixedPrice = 5
      
      return {
        id: examSnap.id,
        title: data.name || data.title || 'ไม่มีชื่อ',
        description: data.description || 'ไม่มีรายละเอียด',
        price: fixedPrice, // ราคาคงที่ 5 บาท
        subject: data.subject || 'ทั่วไป',
        level: data.level || 'ทั่วไป',
        duration: data.duration || 60,
        questionCount: questionCount,
        imageUrl: data.imageUrl || data.image || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt
      } as Exam
    }
    return null
  } catch (error) {
    return null
  }
}

// Get exam with questions for viewing (ดึงพร้อม questions)
export async function getExamWithQuestions(examId: string): Promise<any | null> {
  try {
    const examRef = doc(db, 'exams', examId)
    const examSnap = await getDoc(examRef)
    
    if (examSnap.exists()) {
      const data = examSnap.data()
      
      // แปลง questions object เป็น array ถ้าจำเป็น
      let questionsArray = data.questions || []
      if (!Array.isArray(questionsArray) && typeof questionsArray === 'object') {
        questionsArray = Object.values(questionsArray)
      }
      
      return {
        id: examSnap.id,
        title: data.name || data.title || 'ไม่มีชื่อ',
        description: data.description || 'ไม่มีรายละเอียด',
        subject: data.subject || 'ทั่วไป',
        level: data.level || 'ทั่วไป',
        duration: data.duration || 60,
        imageUrl: data.imageUrl || data.image || '',
        questions: questionsArray,
        createdAt: data.createdAt
      }
    }
    return null
  } catch (error) {
    console.error('❌ Error fetching exam with questions:', error)
    return null
  }
}

// Get exams by subject
export async function getExamsBySubject(subject: string): Promise<Exam[]> {
  try {
    const examsRef = collection(db, 'exams')
    // ใช้แค่ where ไม่ใช้ orderBy
    const q = query(
      examsRef, 
      where('subject', '==', subject)
    )
    const snapshot = await getDocs(q)
    
    const exams = snapshot.docs.map(doc => {
      const data = doc.data()
      
      // คำนวณจำนวนข้อจาก questions array
      const questionCount = data.questions?.length || data.questionCount || 0
      // ราคาคงที่ 5 บาท ทุกชุด
      const fixedPrice = 5
      
      return {
        id: doc.id,
        title: data.name || data.title || 'ไม่มีชื่อ',
        description: data.description || 'ไม่มีรายละเอียด',
        price: fixedPrice, // ราคาคงที่ 5 บาท
        subject: data.subject || 'ทั่วไป',
        level: data.level || 'ทั่วไป',
        duration: data.duration || 60,
        questionCount: questionCount,
        imageUrl: data.imageUrl || data.image || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt
      }
    }) as Exam[]
    
    // เรียงใน JavaScript
    return exams.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA
    })
  } catch (error) {
    console.error('Error fetching exams by subject:', error)
    return []
  }
}

// Get user's purchased exams
export async function getUserExams(userId: string): Promise<ExamOrder[]> {
  try {
    const ordersRef = collection(db, 'examOrders')
    // ใช้แค่ where ไม่ใช้ orderBy
    const q = query(ordersRef, where('userId', '==', userId))
    const snapshot = await getDocs(q)
    
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExamOrder[]
    
    // เรียงใน JavaScript
    return orders.sort((a, b) => {
      const timeA = a.purchaseDate?.toMillis?.() || 0
      const timeB = b.purchaseDate?.toMillis?.() || 0
      return timeB - timeA
    })
  } catch (error) {
    console.error('Error fetching user exams:', error)
    return []
  }
}
