'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, X } from 'lucide-react'

interface InfoModalProps {
  onPromptSelect?: (prompt: string) => void
}

export default function InfoModal({ onPromptSelect }: InfoModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const examplePrompts = [
    {
      title: "Weather Information",
      description: "Get current weather for any location",
      example: "What's the weather in New York?"
    },
    {
      title: "Formula 1 Races", 
      description: "Get information about upcoming F1 races",
      example: "When is the next F1 race?"
    },
    {
      title: "Stock Prices",
      description: "Get real-time stock information", 
      example: "What's Microsoft's stock price?"
    }
  ]

  const handlePromptClick = (prompt: string) => {
    if (onPromptSelect) {
      onPromptSelect(prompt)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* Info Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 p-0"
        title="Show example prompts"
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">AI Assistant - Example Prompts</h2>
                <p className="text-gray-600 mt-1">Click on any example to try it out!</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {examplePrompts.map((prompt, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                    onClick={() => handlePromptClick(prompt.example)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{prompt.title}</CardTitle>
                      <CardDescription>{prompt.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm font-medium text-blue-600">
                          "{prompt.example}"
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click to try this example
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ask natural questions about weather, stocks, or F1 races</li>
                  <li>• Be specific with locations for weather (e.g., "weather in Tokyo")</li>
                  <li>• For stocks, use company names or symbols (e.g., "Apple stock" or "TSLA price")</li>
                  <li>• All data is fetched in real-time from reliable APIs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
