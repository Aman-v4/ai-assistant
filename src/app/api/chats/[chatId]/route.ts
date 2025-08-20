import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { chatId } = await params

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId 
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { chatId } = await params

   
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: userId
      }
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    await prisma.chat.delete({
      where: {
        id: chatId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
