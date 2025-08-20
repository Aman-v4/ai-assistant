import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockData } from "@/lib/tools/stock"
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

interface StockCardProps {
  data: StockData
}

export function StockCard({ data }: StockCardProps) {
  const isPositive = data.change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {data.symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">${data.price.toFixed(2)}</div>
          <div className={`flex items-center justify-center gap-1 ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendIcon className="h-4 w-4" />
            <span>{isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>High: ${data.high.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span>Low: ${data.low.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <BarChart3 className="h-4 w-4" />
            <span>Volume: {data.volume.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
