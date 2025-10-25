import { RegisterForm } from "@/components/auth/register-form"
import { PageTransition } from "@/components/ui/page-transition"

export default function RegisterAccountPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
        <div className="max-w-md mx-auto">
          <RegisterForm />
        </div>
      </div>
    </PageTransition>
  )
}
