'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2 } from 'lucide-react'
import { WeatherCard } from '@/components/ui/tools/WeatherCard'
import { F1Card } from '@/components/ui/tools/F1Card'
import { StockCard } from '@/components/ui/tools/StockCard'
import { useSession } from 'next-auth/react'
import { WeatherData } from '@/lib/tools/weather'
import { F1Race } from '@/lib/tools/f1'
import { StockData } from '@/lib/tools/stock'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: Array<Record<string, unknown>>
  toolData?: WeatherData | F1Race | StockData
  toolType?: string
}

interface ChatInterfaceProps {
  chatId: string
  initialMessages: Message[]
}

export function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          message: input,
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderToolData = (message: Message) => {
    if (!message.toolData || !message.toolType) return null

    switch (message.toolType) {
      case 'weather':
        return <WeatherCard data={message.toolData as WeatherData} />
      case 'f1':
        return <F1Card data={message.toolData as F1Race} />
      case 'stock':
        return <StockCard data={message.toolData as StockData} />
      default:
        return null
    }
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please sign in to use the chat.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card className={`max-w-[80%] p-4 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : ''
              }`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {renderToolData(message)}
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about weather, F1 races, or stock prices..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
