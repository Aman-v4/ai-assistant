'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  if (!session) {
    window.location.href = '/'
    return null
  }

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    setLoading(true)
    const userMessage = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message })
      })
      
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Response received' }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error occurred' }])
    }
    
    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="border rounded-lg h-96 p-4 mb-4 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">Start a conversation with your AI Assistant!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg max-w-xs ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 bg-white border rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                AI is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about weather, F1 races, or stock prices..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading || !message.trim()}>
          Send
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">🌤️ Weather</h3>
          <p className="text-sm text-gray-600">Ask: "What's the weather in London?"</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">🏎️ Formula 1</h3>
          <p className="text-sm text-gray-600">Ask: "When is the next F1 race?"</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">📈 Stocks</h3>
          <p className="text-sm text-gray-600">Ask: "What's Microsoft's stock price?"</p>
        </div>
      </div>
    </div>
  )
}
