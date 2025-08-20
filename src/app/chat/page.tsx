'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, MessageCircle, Plus, LogOut } from 'lucide-react'
import InfoModal from '@/components/ui/InfoModal'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
  _count?: { messages: number }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      if (response.ok) {
        const chatData = await response.json()
        setMessages(chatData.messages)
      }
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }, [])

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats')
      
      if (!response.ok) {
        throw new Error(`Failed to load chats: HTTP ${response.status}`)
      }
      
      const chatsData = await response.json()
      console.log('Loaded chats:', chatsData) // Debug log
      
      // Ensure each chat has proper structure
      const normalizedChats = chatsData.map((chat: any) => ({
        ...chat,
        _count: chat._count || { messages: 0 }
      }))
      
      setChats(normalizedChats)
      if (normalizedChats.length > 0 && !currentChatId) {
        setCurrentChatId(normalizedChats[0].id)
        loadChatMessages(normalizedChats[0].id)
      }
    } catch (error) {
      console.error('Error loading chats:', error)
      // You might want to show a toast notification here
    } finally {
      setLoadingChats(false)
    }
  }, [currentChatId, loadChatMessages])

  // Redirect unauthenticated users - must be called before conditional returns
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Load chats on component mount
  useEffect(() => {
    if (session?.user) {
      loadChats()
    }
  }, [session, loadChats])

  // Handle prompt selection from InfoModal
  const handlePromptSelect = useCallback((prompt: string) => {
    setMessage(prompt)
    // Use requestAnimationFrame for better timing with React updates
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(prompt.length, prompt.length)
      }
    })
  }, [])

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to create new chat: HTTP ${response.status}`)
      }
      
      const newChat = await response.json()
      // Ensure the new chat has proper structure
      const normalizedNewChat = {
        ...newChat,
        _count: newChat._count || { messages: 0 },
        messages: newChat.messages || []
      }
      
      setChats(prev => [normalizedNewChat, ...prev])
      setCurrentChatId(normalizedNewChat.id)
      setMessages([])
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete chat: HTTP ${response.status}`)
      }
      
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId)
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id)
          loadChatMessages(remainingChats[0].id)
        } else {
          setCurrentChatId(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    loadChatMessages(chatId)
  }

  if (!session) {
    return null
  }

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    setLoading(true)
    const userMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: message, 
      createdAt: new Date().toISOString() 
    }
    setMessages(prev => [...prev, userMessage])
    const currentMessage = message
    setMessage('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage, 
          chatId: currentChatId 
        })
      })
      
      const data = await response.json()
      
      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const assistantMessage = {
        id: Date.now().toString() + 1,
        role: 'assistant',
        content: data.message || 'Response received',
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Update current chat ID if it was a new chat
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId)
      }
      
      // Always refresh chat list to update message counts
      if (data.chatId) {
        loadChats()
      }
    } catch (err) {
      console.error('Send message error:', err)
      const errorMessage = {
        id: Date.now().toString() + 1,
        role: 'assistant',
        content: 'Error occurred',
        createdAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    }
    
    setLoading(false)
  }

  // Early returns for loading and auth states
  if (status !== 'authenticated') {
    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }
    
    // Status is 'unauthenticated' - will redirect via useEffect
    return null
  }

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    return null
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Chat History */}
      <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button size="sm" onClick={createNewChat} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
        
        {loadingChats ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : chats.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No chats yet. Start a new conversation!</p>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                  currentChatId === chat.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'bg-white border hover:bg-gray-100'
                }`}
                onClick={() => selectChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{chat.title || 'Untitled Chat'}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {(chat._count?.messages ?? 0)} messages • {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteChat(chat.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* User Info */}
        {/* <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">👋 {session.user?.name}</span>
              <Button size="sm" variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h1 className="text-xl font-semibold">
                {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'Chat' : 'AI Assistant'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <InfoModal onPromptSelect={handlePromptSelect} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="h-8"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Assistant!</h3>
              <p className="text-gray-500 mb-4">Start a conversation by typing a message below.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                <span>💡 Need examples? Click the</span>
                <div className="inline-flex items-center justify-center w-6 h-6 border border-gray-300 rounded bg-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <span>button above!</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border shadow-sm'
                  }`}>
                    <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
                    <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t p-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about weather, F1 races, or stock prices..."
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <Button onClick={sendMessage} disabled={loading || !message.trim()} className="px-6">
                Send
              </Button>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  )
}
