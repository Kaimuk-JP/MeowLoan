import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { PageTransition } from "@/components/ui/page-transition"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size={40} />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </PageTransition>
  )
}
