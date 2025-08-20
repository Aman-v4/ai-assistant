'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Chrome } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/chat')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to AI Assistant</CardTitle>
          <CardDescription>
            Sign in to start chatting with AI and get real-time information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google')}
          >
            <Chrome className="h-4 w-4 mr-2" />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('github')}
          >
            <Github className="h-4 w-4 mr-2" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
