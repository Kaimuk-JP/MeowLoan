import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with your credentials
// Note: In a real application, these would be environment variables
cloudinary.config({
  cloud_name: "dwjwct1nh",
  api_key: "958548296471495",
  api_secret: "uLfID8pSxW7wkLqacWaKqrEecY4",
})

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Convert buffer to base64 string
    const base64String = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64String}`

    // Upload to Cloudinary using the signed upload approach
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "volunteer_slips",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
          } else {
            resolve(result)
          }
        },
      )
    })

    // Return the Cloudinary URL
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
