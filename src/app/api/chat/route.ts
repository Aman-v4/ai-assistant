import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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

async function getStockPrice(symbol: string) {
  try {
    // Clean the input properly
    const cleanSymbol = symbol
      .replace(/stock|price|'s|what's|what|is|the|of/gi, '')
      .trim()
    
    console.log(`Cleaned symbol: "${cleanSymbol}"`)
    
    // Stock symbol mapping
    const stockMap: Record<string, string> = {
      'microsoft': 'MSFT',
      'apple': 'AAPL',
      'google': 'GOOGL',
      'tesla': 'TSLA',
      'amazon': 'AMZN',
      'meta': 'META',
      'netflix': 'NFLX',
      'nvidia': 'NVDA',
      'bajaj': 'BAJAJ-AUTO.NS',
      'bajaj auto': 'BAJAJ-AUTO.NS',
      'bajaj finance': 'BAJFINANCE.NS',
      'bajaj finserv': 'BAJAJFINSV.NS',
      'adani': 'ADANIENT.NS',
      'adani enterprises': 'ADANIENT.NS',
      'adani power': 'ADANIPOWER.NS',
      'tcs': 'TCS.NS',
      'reliance': 'RELIANCE.NS',
      'infosys': 'INFY.NS',
      'wipro': 'WIPRO.NS',
      'hdfc': 'HDFCBANK.NS'
    }
    
    const tickerSymbol = stockMap[cleanSymbol.toLowerCase()] || cleanSymbol.toUpperCase()
    console.log(`Using ticker: ${tickerSymbol}`)
    
    // Method 1: Yahoo Finance API (Most reliable)
    try {
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
        
        if (result && result.meta) {
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
    
    // Method 2: Finnhub API (Backup)
    try {
      const finnhubResponse = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${tickerSymbol}&token=demo`,
        {
          headers: {
            'X-Finnhub-Token': 'demo'
          }
        }
      )
      
      if (finnhubResponse.ok) {
        const finnhubData = await finnhubResponse.json()
        
        if (finnhubData.c && finnhubData.c > 0) {
          const currentPrice = finnhubData.c
          const change = finnhubData.d
          const changePercent = finnhubData.dp
          
          return {
            symbol: tickerSymbol,
            name: cleanSymbol.toUpperCase(),
            price: Math.round(currentPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            currency: '$'
          }
        }
      }
    } catch (finnhubError) {
      console.log('Finnhub failed:', finnhubError)
    }
    
    // Method 3: Alpha Vantage (if API key is valid)
    if (process.env.ALPHA_VANTAGE_API_KEY && process.env.ALPHA_VANTAGE_API_KEY !== 'your-alpha-vantage-api-key') {
      try {
        const avResponse = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tickerSymbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
        )
        
        if (avResponse.ok) {
          const avData = await avResponse.json()
          const quote = avData['Global Quote']
          
          if (quote && quote['05. price']) {
            return {
              symbol: quote['01. symbol'],
              name: quote['01. symbol'],
              price: parseFloat(quote['05. price']),
              change: parseFloat(quote['09. change']),
              changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
              currency: '$'
            }
          }
        }
      } catch (avError) {
        console.log('Alpha Vantage failed:', avError)
      }
    }
    
    throw new Error(`No valid stock data found for ${cleanSymbol}`)
    
  } catch (error) {
    console.error('All stock APIs failed:', error)
    return { 
      error: `Could not fetch LIVE data for "${symbol}". Available stocks: Microsoft, Apple, Google, Tesla, Amazon, Bajaj, TCS, Reliance` 
    }
  }
}

async function getF1NextRace() {
  try {
    const currentYear = new Date().getFullYear()
    const response = await fetch(`https://ergast.com/api/f1/${currentYear}.json`)
    
    if (!response.ok) {
      throw new Error('F1 data not available')
    }
    
    const data = await response.json()
    const races = data.MRData.RaceTable.Races
    const now = new Date()
    
    // Find the next race
    interface Race {
      raceName: string;
      date: string;
      time?: string;
      Circuit: {
        circuitName: string;
        Location: {
          country: string;
          locality: string;
        };
      };
    }
    
    const nextRace = races.find((race: Race) => {
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
  } catch (error) {
    console.error('F1 API error:', error)
    return { error: 'Failed to get F1 race information' }
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

    const { message } = await req.json()
    console.log('Received message:', message)

    // Check if message is asking for weather
    if (message.toLowerCase().includes('weather')) {
      const locationMatch = message.match(/weather.*?in\s+(\w+)/i)
      const location = locationMatch ? locationMatch[1] : 'London'
      
      console.log('Getting weather for:', location)
      const weatherData = await getWeather(location)
      
      if (weatherData.error) {
        return NextResponse.json({ message: weatherData.error })
      }
      
      return NextResponse.json({
        message: `🌤️ **Weather in ${weatherData.location}:**\n` +
                `🌡️ Temperature: ${weatherData.temperature}°C\n` +
                `☁️ Conditions: ${weatherData.description}\n` +
                `💧 Humidity: ${weatherData.humidity}%\n` +
                `💨 Wind Speed: ${weatherData.windSpeed} m/s\n` +
                `👁️ Visibility: ${weatherData.visibility} km`
      })
    }
    
    // Check if message is asking for F1 information
    if (message.toLowerCase().includes('f1') || message.toLowerCase().includes('formula') || message.toLowerCase().includes('race')) {
      console.log('Getting F1 race information')
      const f1Data = await getF1NextRace()
      
      if (f1Data.error) {
        return NextResponse.json({ message: f1Data.error })
      }
      
      return NextResponse.json({
        message: `🏎️ **Next Formula 1 Race:**\n` +
                `🏁 **Race:** ${f1Data.raceName}\n` +
                `🏟️ **Circuit:** ${f1Data.circuitName}\n` +
                `📍 **Location:** ${f1Data.locality}, ${f1Data.country}\n` +
                `📅 **Date:** ${new Date(f1Data.date).toLocaleDateString()}\n` +
                `⏰ **Time:** ${f1Data.time === 'TBA' ? 'TBA' : f1Data.time}`
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
      
      return NextResponse.json({
        message: `📈 **${stockData.name} (${stockData.symbol})**\n` +
                `💰 **Current Price:** ${stockData.currency}${stockData.price}\n` +
                `${changeColor} **Change:** ${changeText}${stockData.change} (${changeText}${stockData.changePercent}%)\n` +
                `🕒 **Last Updated:** ${new Date().toLocaleString()}`
      })
    }

    // Default response for other messages
    return NextResponse.json({
      message: "I can help you with:\n" +
               "🌤️ **Weather** - try 'What's the weather in London?'\n" +
               "📈 **Stock prices** - try 'What's Microsoft stock price?'\n" +
               "🏎️ **F1 races** - try 'When is the next F1 race?'\n" +
               "\nWhat would you like to know?"
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { message: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
