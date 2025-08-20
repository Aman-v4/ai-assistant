import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    
    const chats = await prisma.chat.findMany({
      where: {
        userId: userId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          take: 1 
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { title } = await request.json()

    const chat = await prisma.chat.create({
      data: {
        userId: userId,
        title: title || 'New Chat'
      }
    })

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
