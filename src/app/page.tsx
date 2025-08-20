'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Chrome, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {session.user?.name}
            </span>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Weather Information</CardTitle>
              <CardDescription>Get current weather for any location</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask: &quot;What&apos;s the weather in New York?&quot;
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formula 1 Races</CardTitle>
              <CardDescription>Get information about upcoming F1 races</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask: &quot;When is the next F1 race?&quot;
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Prices</CardTitle>
              <CardDescription>Get real-time stock information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask: &quot;What&apos;s Microsoft&apos;s stock price?&quot;
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Link href="/chat">
            <Button size="lg">Start Chatting</Button>
          </Link>
        </div>
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
