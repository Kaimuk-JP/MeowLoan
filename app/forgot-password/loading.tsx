import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner className="h-12 w-12 text-blue-500" />
        <p className="text-lg font-medium text-gray-700">กำลังโหลด...</p>
      </div>
    </div>
  )
}
