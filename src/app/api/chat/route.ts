import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function getWeather(location: string) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      throw new Error('Weather data not found')
    }
    
    const data = await response.json()
    
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      pressure: data.main.pressure,
      visibility: Math.round((data.visibility || 0) / 1000),
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return { error: `Failed to get weather for ${location}` }
  }
}

// Simple in-memory cache for symbol searches (resets on server restart)
const symbolCache = new Map<string, string>()

// Universal dynamic stock symbol search using multiple APIs
async function searchStockSymbol(companyName: string): Promise<string | null> {
  // Check cache first
  const cacheKey = companyName.toLowerCase().trim()
  if (symbolCache.has(cacheKey)) {
    console.log(`Found cached symbol for: ${companyName}`)
    return symbolCache.get(cacheKey)!
  }

  console.log(`Searching for symbol: "${companyName}"`)

  // Try Twelve Data symbol search first (if available)
  if (process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY !== 'your_twelve_data_api_key_here') {
    try {
      console.log('Trying Twelve Data symbol search...')
      const searchResponse = await fetch(
        `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(companyName)}&apikey=${process.env.TWELVE_DATA_API_KEY}`
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log('Twelve Data search response:', searchData)

        if (searchData.data && searchData.data.length > 0) {
          // Find the best match
          let bestSymbol = null
          let bestScore = 0

          for (const match of searchData.data) {
            const symbol = match.symbol
            const name = match.instrument_name?.toLowerCase() || ''
            const country = match.country
            const exchange = match.exchange
            
            // Calculate relevance score
            let score = 0.5
            
            // Boost for name similarity
            if (name.includes(companyName.toLowerCase()) || companyName.toLowerCase().includes(name)) {
              score += 0.4
            }
            
            // Prefer major exchanges
            if (['NASDAQ', 'NYSE', 'NSE', 'BSE'].includes(exchange)) {
              score += 0.2
            }
            
            // Region preferences
            if (country === 'India' && ['tcs', 'reliance', 'infosys', 'wipro', 'bajaj', 'adani', 'hdfc', 'icici', 'sbi'].some(term => 
                companyName.toLowerCase().includes(term))) {
              score += 0.3
            }
            
            if (country === 'United States' && !companyName.toLowerCase().includes('india')) {
              score += 0.1
            }
            
            console.log(`${symbol} (${name}) - Score: ${score}`)
            
            if (score > bestScore && score > 0.6) {
              bestScore = score
              bestSymbol = symbol
            }
          }
          
          if (bestSymbol) {
            console.log(`Twelve Data found symbol: ${bestSymbol}`)
            symbolCache.set(cacheKey, bestSymbol)
            return bestSymbol
          }
        }
      }
    } catch (error) {
      console.log('Twelve Data symbol search failed:', error)
    }
  }

  // Try Alpha Vantage symbol search (if available)
  if (process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'your_actual_alpha_vantage_api_key_here') {
    try {
      console.log('Trying Alpha Vantage symbol search...')
      const searchResponse = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        
        if (searchData['bestMatches'] && searchData['bestMatches'].length > 0) {
          const bestMatch = searchData['bestMatches'][0]
          const symbol = bestMatch['1. symbol']
          const matchScore = parseFloat(bestMatch['9. matchScore'])
          
          if (matchScore > 0.5) {
            console.log(`Alpha Vantage found symbol: ${symbol}`)
            symbolCache.set(cacheKey, symbol)
            return symbol
          }
        }
      }
    } catch (error) {
      console.log('Alpha Vantage symbol search failed:', error)
    }
  }

  // Try Yahoo Finance search as fallback (no API key needed)
  try {
    console.log('Trying Yahoo Finance symbol search...')
    // Yahoo Finance search endpoint
    const searchResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(companyName)}&quotesCount=5&newsCount=0`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    if (searchResponse.ok) {
      const searchData = await searchResponse.json()
      console.log('Yahoo Finance search response:', searchData)

      if (searchData.quotes && searchData.quotes.length > 0) {
        // Find best match
        for (const quote of searchData.quotes) {
          const symbol = quote.symbol
          const name = quote.longname || quote.shortname || ''
          
          // Prefer exact matches or high relevance
          if (name.toLowerCase().includes(companyName.toLowerCase()) || 
              companyName.toLowerCase().includes(name.toLowerCase())) {
            console.log(`Yahoo Finance found symbol: ${symbol}`)
            symbolCache.set(cacheKey, symbol)
            return symbol
          }
        }
        
        // If no exact match, take the first result if it's reasonable
        const firstResult = searchData.quotes[0]
        if (firstResult && firstResult.symbol) {
          console.log(`Yahoo Finance found symbol (first result): ${firstResult.symbol}`)
          symbolCache.set(cacheKey, firstResult.symbol)
          return firstResult.symbol
        }
      }
    }
  } catch (error) {
    console.log('Yahoo Finance symbol search failed:', error)
  }

  console.log(`No symbol found for: ${companyName}`)
  return null
}

// Simple company name processing - no hardcoding!
function processCompanyName(input: string): string[] {
  const cleaned = input
    .replace(/stock|price|'s|what's|what|is|the|of|share/gi, '')
    .trim()
  
  // Return multiple search variations to improve matching
  const variations = [
    cleaned,                                    // Exact input
    cleaned.replace(/\s+/g, ' '),              // Normalized spaces
    cleaned.toLowerCase(),                      // Lowercase
  ]
  
  // Add common corporate suffixes to improve search
  const withSuffixes = [
    cleaned + ' Inc',
    cleaned + ' Corporation', 
    cleaned + ' Limited',
    cleaned + ' Ltd',
    cleaned + ' Company'
  ]
  
  return [...variations, ...withSuffixes].filter((v, i, arr) => arr.indexOf(v) === i && v.length > 0)
}

async function getStockPrice(symbol: string) {
  try {
    console.log(`Original input: "${symbol}"`)
    
    // Process company name and get variations
    const companyVariations = processCompanyName(symbol)
    console.log(`Company variations: ${companyVariations.join(', ')}`)
    
    let tickerSymbol = companyVariations[0].toUpperCase()
    
    // Try to find the symbol using dynamic search with each variation
    for (const variation of companyVariations) {
      const foundSymbol = await searchStockSymbol(variation)
      if (foundSymbol) {
        tickerSymbol = foundSymbol
        console.log(`Dynamic search found ticker: ${tickerSymbol} for variation: ${variation}`)
        break
      }
    }
    
    if (!tickerSymbol || tickerSymbol === companyVariations[0].toUpperCase()) {
      console.log(`No symbol found via search, using direct input: ${tickerSymbol}`)
    }
    
    // PRIORITY 1: Twelve Data API (Free 800 requests/day, supports NSE/BSE + international)
    if (process.env.TWELVE_DATA_API_KEY && process.env.TWELVE_DATA_API_KEY !== 'your_twelve_data_api_key_here') {
      try {
        console.log('Trying Twelve Data API...')
        const twelveResponse = await fetch(
          `https://api.twelvedata.com/quote?symbol=${tickerSymbol}&apikey=${process.env.TWELVE_DATA_API_KEY}`
        )
        
        if (twelveResponse.ok) {
          const twelveData = await twelveResponse.json()
          console.log('Twelve Data response:', twelveData)
          
          if (twelveData.code && twelveData.code === 429) {
            console.log('Twelve Data API limit reached')
          } else if (twelveData.status === 'error') {
            console.log('Twelve Data error:', twelveData.message)
          } else if (twelveData.symbol && twelveData.close) {
            const currentPrice = parseFloat(twelveData.close)
            const change = parseFloat(twelveData.change)
            const changePercent = parseFloat(twelveData.percent_change)
            
            return {
              symbol: twelveData.symbol,
              name: twelveData.name || twelveData.symbol,
              price: Math.round(currentPrice * 100) / 100,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100,
              currency: twelveData.currency || (tickerSymbol.includes('.NS') ? '₹' : '$')
            }
          }
        }
      } catch (twelveError) {
        console.log('Twelve Data failed:', twelveError)
      }
    } else {
      console.log('Twelve Data API key not configured')
    }

    // PRIORITY 2: Polygon.io (Free 1000 requests/day, excellent for US stocks)
    if (process.env.POLYGON_API_KEY && process.env.POLYGON_API_KEY !== 'your_polygon_api_key_here') {
      try {
        console.log('Trying Polygon.io API...')
        // Get previous business day for comparison
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const dateStr = yesterday.toISOString().split('T')[0]
        
        const polygonResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${tickerSymbol}/prev?adjusted=true&apikey=${process.env.POLYGON_API_KEY}`
        )
        
        if (polygonResponse.ok) {
          const polygonData = await polygonResponse.json()
          console.log('Polygon response:', polygonData)
          
          if (polygonData.status === 'OK' && polygonData.results && polygonData.results.length > 0) {
            const result = polygonData.results[0]
            const currentPrice = result.c
            const previousClose = result.o
            const change = currentPrice - previousClose
            const changePercent = (change / previousClose) * 100
            
            return {
              symbol: polygonData.ticker || tickerSymbol,
              name: tickerSymbol,
              price: Math.round(currentPrice * 100) / 100,
              change: Math.round(change * 100) / 100,
              changePercent: Math.round(changePercent * 100) / 100,
              currency: '$'
            }
          }
        }
      } catch (polygonError) {
        console.log('Polygon failed:', polygonError)
      }
    } else {
      console.log('Polygon API key not configured')
    }

    // PRIORITY 3: Finnhub (Free 60 calls/minute, good global coverage)
    try {
      console.log('Trying Finnhub API...')
      const finnhubApiKey = process.env.FINNHUB_API_KEY || 'demo'
      const finnhubResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${tickerSymbol}&token=${finnhubApiKey}`
      )
      
      if (finnhubResponse.ok) {
        const finnhubData = await finnhubResponse.json()
        console.log('Finnhub response:', finnhubData)
        
        if (finnhubData.c && finnhubData.c > 0) {
          const currentPrice = finnhubData.c
          const change = finnhubData.d || 0
          const changePercent = finnhubData.dp || 0
          
          return {
            symbol: tickerSymbol,
            name: tickerSymbol,
            price: Math.round(currentPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            currency: tickerSymbol.includes('.NS') ? '₹' : '$'
          }
        }
      }
    } catch (finnhubError) {
      console.log('Finnhub failed:', finnhubError)
    }

    // PRIORITY 4: Alpha Vantage (Your API with real key - keeping as backup)
    if (process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'your-alpha-vantage-api-key' && process.env.ALPHA_VANTAGE_API_KEY !== 'your_actual_alpha_vantage_api_key_here') {
      try {
        console.log('Trying Alpha Vantage API...')
        const avResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerSymbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        )
        
        if (avResponse.ok) {
          const avData = await avResponse.json()
          console.log('Alpha Vantage response:', avData)
          
          // Check for API limit reached
          if (avData['Note'] && avData['Note'].includes('API call frequency')) {
            console.log('Alpha Vantage API limit reached')
          } else if (avData['Error Message']) {
            console.log('Alpha Vantage error:', avData['Error Message'])
          } else {
            const quote = avData['Global Quote']
            
            if (quote && quote['05. price']) {
              const price = parseFloat(quote['05. price'])
              const change = parseFloat(quote['09. change'])
              const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
              
              return {
                symbol: quote['01. symbol'],
                name: quote['01. symbol'],
                price: Math.round(price * 100) / 100,
                change: Math.round(change * 100) / 100,
                changePercent: Math.round(changePercent * 100) / 100,
                currency: tickerSymbol.includes('.NS') ? '₹' : '$'
              }
            }
          }
        }
      } catch (avError) {
        console.log('Alpha Vantage failed:', avError)
      }
    } else {
      console.log('Alpha Vantage API key not configured properly')
    }
    
    // PRIORITY 5: Yahoo Finance API (Reliable fallback for both Indian and international)
    try {
      console.log('Trying Yahoo Finance API...')
      const yahooResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${tickerSymbol}?interval=1d&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      )
      
      if (yahooResponse.ok) {
        const yahooData = await yahooResponse.json()
        const result = yahooData.chart?.result?.[0]
        
        if (result && result.meta && result.meta.regularMarketPrice) {
          const meta = result.meta
          const currentPrice = meta.regularMarketPrice
          const previousClose = meta.previousClose
          const change = currentPrice - previousClose
          const changePercent = (change / previousClose) * 100
          
          return {
            symbol: meta.symbol,
            name: meta.shortName || meta.longName || meta.symbol,
            price: Math.round(currentPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            currency: meta.currency === 'INR' ? '₹' : '$'
          }
        }
      }
    } catch (yahooError) {
      console.log('Yahoo Finance failed:', yahooError)
    }
    
    throw new Error(`No valid stock data found for ${symbol}`)
    
  } catch (error) {
    console.error('All stock APIs failed:', error)
    return { 
      error: `Could not fetch LIVE data for "${symbol}". The system tried multiple free APIs (Twelve Data, Polygon.io, Finnhub, Alpha Vantage, Yahoo Finance) but none returned valid data. This could be due to:\n• Invalid symbol or company name\n• Market is closed\n• API rate limits reached\n• Temporary service issues\n\nTry asking for well-known companies like: Microsoft, Apple, Google, Tesla, TCS, Reliance, Infosys, etc.` 
    }
  }
}

async function getF1NextRace() {
  try {
    console.log('Fetching F1 race data...')
    
    // Try OpenF1 API first (free and currently working)
    try {
      const sessionsResponse = await fetch('https://api.openf1.org/v1/sessions?session_type=Race&year=2024', {
        headers: {
          'User-Agent': 'AI-Assistant/1.0'
        }
      })
      
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        console.log('OpenF1 response received')
        
        if (sessions && sessions.length > 0) {
          const now = new Date()
          
          // Find the next race or the latest one
          const nextSession = sessions.find((session: any) => {
            const sessionDate = new Date(session.date_start)
            return sessionDate > now
          }) || sessions[sessions.length - 1]
          
          if (nextSession) {
            const meetingResponse = await fetch(`https://api.openf1.org/v1/meetings?meeting_key=${nextSession.meeting_key}`)
            const meetings = await meetingResponse.json()
            const meeting = meetings[0]
            
            return {
              raceName: meeting?.meeting_name || 'Formula 1 Race',
              circuitName: meeting?.circuit_short_name || 'Circuit',
              date: nextSession.date_start?.split('T')[0] || 'TBA',
              time: nextSession.date_start ? new Date(nextSession.date_start).toLocaleTimeString('en-US', { timeZone: 'UTC' }) : 'TBA',
              country: meeting?.country_name || 'TBA',
              locality: meeting?.location || meeting?.circuit_short_name || 'TBA',
            }
          }
        }
      }
    } catch (openF1Error) {
      console.log('OpenF1 API failed:', openF1Error)
    }
    
    // Fallback: Try F1 Live API
    try {
      const f1LiveResponse = await fetch('https://api.jolpi.ca/ergast/f1/current.json', {
        headers: {
          'User-Agent': 'AI-Assistant/1.0'
        }
      })
      
      if (f1LiveResponse.ok) {
        const data = await f1LiveResponse.json()
        const races = data.MRData?.RaceTable?.Races
        
        if (races && races.length > 0) {
          const now = new Date()
          
          const nextRace = races.find((race: any) => {
            const raceDate = new Date(`${race.date}T${race.time || '00:00:00'}`)
            return raceDate > now
          }) || races[races.length - 1]
          
          return {
            raceName: nextRace.raceName,
            circuitName: nextRace.Circuit.circuitName,
            date: nextRace.date,
            time: nextRace.time || 'TBA',
            country: nextRace.Circuit.Location.country,
            locality: nextRace.Circuit.Location.locality,
          }
        }
      }
    } catch (jolpicaError) {
      console.log('Jolpica API failed:', jolpicaError)
    }
    
    // Last resort: Return static info about current F1 season
    return {
      raceName: 'Formula 1 Race Weekend',
      circuitName: 'Check F1 Official Website',
      date: 'TBA',
      time: 'TBA',
      country: 'Various',
      locality: 'Visit formula1.com for latest schedule',
    }
    
  } catch (error) {
    console.error('All F1 APIs failed:', error)
    return { error: 'F1 race information temporarily unavailable. The old Ergast API was shut down. Please check formula1.com for the latest race schedule.' }
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ message: 'Chat GET endpoint working' })
  } catch (err) {
    console.error('GET chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, chatId } = await req.json()
    console.log('Received message:', message, 'Chat ID:', chatId)
    
    const userId = (session.user as any).id
    let currentChatId = chatId

    // Create new chat if no chatId provided
    if (!currentChatId) {
      const newChat = await prisma.chat.create({
        data: {
          userId: userId,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''), // Use first 50 chars as title
        }
      })
      currentChatId = newChat.id
      console.log('Created new chat:', currentChatId)
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: 'user',
        content: message,
      }
    })
    console.log('Saved user message:', userMessage.id)

    // Check if message is asking for weather
    if (message.toLowerCase().includes('weather')) {
      const locationMatch = message.match(/weather.*?in\s+(\w+)/i)
      const location = locationMatch ? locationMatch[1] : 'London'
      
      console.log('Getting weather for:', location)
      const weatherData = await getWeather(location)
      
      if (weatherData.error) {
        return NextResponse.json({ message: weatherData.error })
      }
      
      const responseText = `🌤️ **Weather in ${weatherData.location}:**\n` +
                `🌡️ Temperature: ${weatherData.temperature}°C\n` +
                `☁️ Conditions: ${weatherData.description}\n` +
                `💧 Humidity: ${weatherData.humidity}%\n` +
                `💨 Wind Speed: ${weatherData.windSpeed} m/s\n` +
                `👁️ Visibility: ${weatherData.visibility} km`
      
      // Save assistant response
      await prisma.message.create({
        data: {
          chatId: currentChatId,
          role: 'assistant',
          content: responseText,
          toolCalls: { type: 'weather', data: weatherData }
        }
      })

      return NextResponse.json({
        message: responseText,
        chatId: currentChatId
      })
    }
    
    // Check if message is asking for F1 information
    if (message.toLowerCase().includes('f1') || message.toLowerCase().includes('formula') || message.toLowerCase().includes('race')) {
      console.log('Getting F1 race information')
      const f1Data = await getF1NextRace()
      
      if (f1Data.error) {
        return NextResponse.json({ message: f1Data.error })
      }
      
      const responseText = `🏎️ **Next Formula 1 Race:**\n` +
                `🏁 **Race:** ${f1Data.raceName}\n` +
                `🏟️ **Circuit:** ${f1Data.circuitName}\n` +
                `📍 **Location:** ${f1Data.locality}, ${f1Data.country}\n` +
                `📅 **Date:** ${new Date(f1Data.date).toLocaleDateString()}\n` +
                `⏰ **Time:** ${f1Data.time === 'TBA' ? 'TBA' : f1Data.time}`
      
      // Save assistant response
      await prisma.message.create({
        data: {
          chatId: currentChatId,
          role: 'assistant',
          content: responseText,
          toolCalls: { type: 'f1', data: f1Data }
        }
      })

      return NextResponse.json({
        message: responseText,
        chatId: currentChatId
      })
    }
    
    // Check if message is asking for stock price
    if (message.toLowerCase().includes('stock') || message.toLowerCase().includes('price')) {
      // Extract company name more accurately
      let symbol = ''
      
      // Try different patterns
      const patterns = [
        /what'?s\s+([^'s]+?)(?:'s)?\s+stock/i,
        /([a-zA-Z\s]+?)\s+stock\s+price/i,
        /([a-zA-Z\s]+?)(?:'s)?\s+stock/i,
        /stock\s+price\s+(?:of\s+)?([a-zA-Z\s]+)/i,
        /price\s+of\s+([a-zA-Z\s]+)/i
      ]
      
      for (const pattern of patterns) {
        const match = message.match(pattern)
        if (match && match[1]) {
          symbol = match[1].trim()
          break
        }
      }
      
      if (!symbol) {
        // Fallback extraction
        symbol = message.replace(/what'?s|stock|price|the|of/gi, '').trim()
      }
      
      console.log('Extracted symbol:', symbol)
      console.log('Getting stock price for:', symbol)
      const stockData = await getStockPrice(symbol)
      
      if (stockData.error) {
        return NextResponse.json({ message: stockData.error })
      }
      
      const changeText = (stockData.change || 0) >= 0 ? '+' : ''
      const changeColor = (stockData.change || 0) >= 0 ? '🟢' : '🔴'
      
      const responseText = `📈 **${stockData.name} (${stockData.symbol})**\n` +
                `💰 **Current Price:** ${stockData.currency}${stockData.price}\n` +
                `${changeColor} **Change:** ${changeText}${stockData.change} (${changeText}${stockData.changePercent}%)\n` +
                `🕒 **Last Updated:** ${new Date().toLocaleString()}`
      
      // Save assistant response
      await prisma.message.create({
        data: {
          chatId: currentChatId,
          role: 'assistant',
          content: responseText,
          toolCalls: { type: 'stock', data: stockData }
        }
      })

      return NextResponse.json({
        message: responseText,
        chatId: currentChatId
      })
    }

    // Default response for other messages
    const defaultResponse = "I can help you with:\n" +
               "🌤️ **Weather** - try 'What's the weather in London?'\n" +
               "📈 **Stock prices** - try 'What's Microsoft stock price?'\n" +
               "🏎️ **F1 races** - try 'When is the next F1 race?'\n" +
               "\nWhat would you like to know?"
    
    // Save assistant response
    await prisma.message.create({
      data: {
        chatId: currentChatId,
        role: 'assistant',
        content: defaultResponse,
      }
    })

    return NextResponse.json({
      message: defaultResponse,
      chatId: currentChatId
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
