export interface WeatherData {
    location: string
    temperature: number
    description: string
    humidity: number
    windSpeed: number
    icon: string
  }
  
  export async function getWeather(location: string): Promise<WeatherData> {
    const apiKey = process.env.OPENWEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      location
    )}&appid=${apiKey}&units=metric`
  
    try {
      const response = await fetch(url)
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
        icon: data.weather.icon,
      }
    } catch (error) {
      throw new Error(`Failed to fetch weather data: ${error}`)
    }
  }
  