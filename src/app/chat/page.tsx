import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/')
  }

  // Create or get existing chat
  let chat = await prisma.chat.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true },
  })

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: 'New Chat',
      },
      include: { messages: true },
    })
  }

  const messages = chat.messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'tool',
    content: msg.content,
    toolCalls: msg.toolCalls,
  }))

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>
      <ChatInterface chatId={chat.id} initialMessages={messages} />
    </div>
  )
}
