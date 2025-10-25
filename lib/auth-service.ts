import { auth, db } from "./firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

// Types
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  phone?: string
  idNumber?: string
  studentId?: string
  photoURL?: string
  role: "admin" | "user"
  createdAt: Date
}

// แก้ไขฟังก์ชัน checkEmailExists เพื่อตรวจสอบรูปแบบอีเมลก่อน
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    // ตรวจสอบว่าอีเมลไม่ว่างและมีรูปแบบที่ถูกต้อง
    if (!email || !email.includes("@") || !email.includes(".")) {
      console.log("Invalid email format:", email)
      return false
    }

    console.log("Checking if email exists:", email)
    const methods = await fetchSignInMethodsForEmail(auth, email)
    return methods.length > 0
  } catch (error) {
    console.error("Error checking if email exists:", error)
    // If there's an error checking, we'll assume the email doesn't exist
    return false
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string): Promise<User> {
  try {
    console.log("Attempting to sign in user:", email)

    if (!email || !password) {
      const error = new Error("Email and password are required") as any
      error.code = "auth/invalid-credential"
      throw error
    }

    // Real authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("User signed in successfully:", userCredential.user.uid)

    // Ensure user profile exists in database
    const userProfile = await getUserProfile(userCredential.user.uid)
    if (!userProfile) {
      console.log("Creating user profile for existing auth user")
      // Create a basic profile if it doesn't exist
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split("@")[0],
        role: "user",
        createdAt: new Date(),
      })
    }

    return userCredential.user
  } catch (error: any) {
    console.error("Error signing in:", error)

    // Ensure error has a code property for consistent error handling
    if (!error.code) {
      error.code = "auth/invalid-credential"
    }

    throw error
  }
}

// Register a new user
export async function registerUser(email: string, password: string, displayName: string, idNumber?: string, studentId?: string, photoURL?: string): Promise<User> {
  try {
    console.log("Starting user registration process for:", email)

    // Check if email already exists before attempting to create user
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      console.log("Email already exists:", email)
      const error = new Error("Email already in use") as any
      error.code = "auth/email-already-in-use"
      throw error
    }

    // Create Firebase auth user
    console.log("Creating Firebase auth user")
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    const userProfile: any = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: "user", // Default role for new users
      createdAt: new Date(),
    }

    // Add optional fields if provided
    if (idNumber) {
      userProfile.idNumber = idNumber
    }
    if (studentId) {
      userProfile.studentId = studentId
    }
    if (photoURL) {
      userProfile.photoURL = photoURL
    }

    console.log("Saving user profile to Firestore:", userProfile)
    await setDoc(doc(db, "users", user.uid), userProfile)
    console.log("User profile saved successfully to Firestore")

    console.log("User registration completed successfully")
    return user
  } catch (error: any) {
    console.error("Error registering user:", error)
    // Make sure the error has a code property for consistent error handling
    if (!error.code && error.message && error.message.includes("already in use")) {
      error.code = "auth/email-already-in-use"
    }
    throw error
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    console.log("Signing out user")
    await firebaseSignOut(auth)
    console.log("User signed out successfully")
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// เพิ่มฟังก์ชัน logout ถ้ายังไม่มี
export async function logout() {
  try {
    await firebaseSignOut(auth)
    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { success: false, error }
  }
}

// Get current user
export function getCurrentUser(): User | null {
  return auth.currentUser
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    console.log("Fetching user profile from database for:", uid)

    // Real profile fetch
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile
      console.log("User profile retrieved from database:", userData)
      return userData
    }

    console.log("User profile not found in database for:", uid)
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// Update user profile in Firestore
export async function updateUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
  try {
    console.log("Updating user profile for:", uid, profileData)

    // Real update
    const userRef = doc(db, "users", uid)

    // Check if document exists
    const docSnap = await getDoc(userRef)

    if (docSnap.exists()) {
      // Update existing document
      console.log("Updating existing user profile in database")
      await setDoc(
        userRef,
        {
          ...docSnap.data(),
          ...profileData,
          updatedAt: new Date(),
        },
        { merge: true },
      )
    } else {
      // Create new document
      console.log("Creating new user profile in database")
      await setDoc(userRef, {
        uid,
        ...profileData,
        createdAt: new Date(),
      })
    }

    console.log("User profile update completed")
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Check if user is admin
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userProfile = await getUserProfile(uid)
    return userProfile?.role === "admin"
  } catch (error) {
    console.error("Error checking if user is admin:", error)
    return false
  }
}

// Get user orders
export async function getUserOrders(uid: string) {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", uid))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw error
  }
}

// Subscribe to auth state changes
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

// Send password reset email
export async function sendPasswordResetEmail(email: string): Promise<void> {
  try {
    console.log("Sending password reset email to:", email)

    // Validate email format
    if (!email || !email.includes("@") || !email.includes(".")) {
      const error = new Error("Invalid email format") as any
      error.code = "auth/invalid-email"
      throw error
    }

    // Check if email exists in Firebase
    const emailExists = await checkEmailExists(email)
    if (!emailExists) {
      console.log("Email not found in system:", email)
      // We don't throw an error here for security reasons
      // Instead, we'll still return success but no email will be sent
      // This prevents user enumeration attacks
    }

    // Send password reset email
    await firebaseSendPasswordResetEmail(auth, email)
    console.log("Password reset email sent successfully")
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}
