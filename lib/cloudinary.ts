// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: "dwjwct1nh",
  apiKey: "958548296471495",
  uploadPreset: "volunteer_slips",  
}

// Function to upload image to Cloudinary
export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    console.log("Starting Cloudinary upload process")

    // For demo/preview environment, we'll use a data URL instead of actual Cloudinary
    // This is because we can't perform signed uploads from the client side securely
    // In a production environment, you would use a server-side API endpoint for this
    console.log("Using data URL for image in preview environment")
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("Image converted to data URL")
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })

    /* 
    // This code would be used in a production environment with a server-side API
    // that handles the signed upload to Cloudinary
    
    const formData = new FormData()
    formData.append("file", file)
    
    // In a real implementation, this would be a call to your backend API
    // that handles the signed upload to Cloudinary
    const response = await fetch("/api/upload-to-cloudinary", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Cloudinary error:", errorData)
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Cloudinary upload successful:", data.secure_url)
    return data.secure_url
    */
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error)

    // Fallback to data URL in case of error
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log("Fallback: Image converted to data URL")
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
}
