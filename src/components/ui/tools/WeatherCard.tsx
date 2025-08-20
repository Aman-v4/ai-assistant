import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherData } from "@/lib/tools/weather"
import { Cloud, Droplets, Wind } from "lucide-react"

interface WeatherCardProps {
  data: WeatherData
}

export function WeatherCard({ data }: WeatherCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          {data.location}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{data.temperature}°C</div>
          <p className="text-muted-foreground capitalize">{data.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span>Humidity: {data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4" />
            <span>Wind: {data.windSpeed} m/s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
