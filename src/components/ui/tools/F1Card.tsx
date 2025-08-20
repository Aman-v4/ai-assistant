import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { F1Race } from "@/lib/tools/f1"
import { Trophy, MapPin, Calendar, Clock } from "lucide-react"

interface F1CardProps {
  data: F1Race
}

export function F1Card({ data }: F1CardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (timeString === 'TBA') return 'Time TBA'
    return new Date(`2023-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Next F1 Race
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{data.raceName}</h3>
          <p className="text-muted-foreground">{data.circuitName}</p>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{data.locality}, {data.country}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(data.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatTime(data.time)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
