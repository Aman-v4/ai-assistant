import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getWeather } from '@/lib/tools/weather'
import { getF1Matches } from '@/lib/tools/f1'
import { getStockPrice } from '@/lib/tools/stock'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const tools = [
  {
    type: 'function' as const,
    function: {
      name: 'getWeather',
      description: 'Get current weather information for a specific location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city or location name',
          },
        },
        required: ['location'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getF1Matches',
      description: 'Get information about the next Formula 1 race',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getStockPrice',
      description: 'Get current stock price and information for a stock symbol',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The stock symbol (e.g., AAPL, GOOGL)',
          },
        },
        required: ['symbol'],
      },
    },
  },
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, message, messages } = await req.json()

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: message,
      },
    })

    // Create OpenAI messages format
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      tools,
      tool_choice: 'auto',
    })

    const assistantMessage = response.choices[0].message
    
    let toolData = null
    let toolType = null

    // Handle tool calls
    if (assistantMessage.tool_calls) {
      const toolCall = assistantMessage.tool_calls
      const functionName = toolCall.function.name
      const args = JSON.parse(toolCall.function.arguments)

      try {
        switch (functionName) {
          case 'getWeather':
            toolData = await getWeather(args.location)
            toolType = 'weather'
            break
          case 'getF1Matches':
            toolData = await getF1Matches()
            toolType = 'f1'
            break
          case 'getStockPrice':
            toolData = await getStockPrice(args.symbol)
            toolType = 'stock'
            break
        }
      } catch (error) {
        console.error(`Tool call error for ${functionName}:`, error)
      }
    }

    const responseMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: assistantMessage.content || 'Here is the information you requested:',
      toolCalls: assistantMessage.tool_calls,
      toolData,
      toolType,
    }

    // Save assistant message
    await prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        content: responseMessage.content,
        toolCalls: assistantMessage.tool_calls || undefined,
      },
    })

    return NextResponse.json({ message: responseMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
