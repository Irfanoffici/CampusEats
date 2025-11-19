'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Redirect based on role
    switch (session.user.role) {
      case 'STUDENT':
        router.push('/dashboard/student')
        break
      case 'VENDOR':
        router.push('/dashboard/vendor')
        break
      case 'ADMIN':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/login')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  )
}
