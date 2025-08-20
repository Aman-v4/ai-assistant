'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Chrome, Bot, MessageSquare, Zap, Shield, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Brand and features */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-16 text-white">
          <div className="max-w-lg">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl mr-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Assistant
              </h1>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Your intelligent companion for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                everything
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 leading-relaxed">
              Experience the power of AI with real-time data access, intelligent conversations, 
              and seamless integration with your workflow.
            </p>

            {/* Feature highlights */}
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                  <MessageSquare className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Conversations</h3>
                  <p className="text-slate-400">Natural, context-aware AI interactions</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-cyan-500/20 rounded-lg mr-4">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Real-time Data</h3>
                  <p className="text-slate-400">Access live information and updates</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2 bg-pink-500/20 rounded-lg mr-4">
                  <Shield className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Secure & Private</h3>
                  <p className="text-slate-400">Your data is protected and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-lg">
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4 lg:hidden">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  Sign in to continue your AI-powered journey
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg font-medium bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white transition-all duration-200 backdrop-blur-sm"
                  onClick={() => signIn('google')}
                >
                  <Chrome className="h-5 w-5 mr-3" />
                  Continue with Google
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg font-medium bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white transition-all duration-200 backdrop-blur-sm"
                  onClick={() => signIn('github')}
                >
                  <Github className="h-5 w-5 mr-3" />
                  Continue with GitHub
                </Button>

                <div className="flex items-center justify-center mt-8">
                  <div className="flex items-center text-slate-400 text-sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Join thousands of users already using AI Assistant
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mobile features - shown only on small screens */}
            <div className="lg:hidden mt-12 space-y-6">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose AI Assistant?</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <MessageSquare className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Smart Chat</h4>
                  <p className="text-slate-400 text-sm">Natural conversations</p>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <Zap className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Real-time</h4>
                  <p className="text-slate-400 text-sm">Live data access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
