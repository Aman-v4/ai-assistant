export interface StockData {
    symbol: string
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    volume: number
  }
  
  export async function getStockPrice(symbol: string): Promise<StockData> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
  
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Stock data not available')
      }
  
      const data = await response.json()
      const quote = data['Global Quote']
      
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('Invalid stock symbol')
      }
  
      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
      }
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error}`)
    }
  }
  