"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Wifi, WifiOff, AlertTriangle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Import API functions - you'll need to create these
import { startCapture, stopCapture } from "/Users/sn78/Downloads/Velink/frontend/src/services/api.js"
// Import WebSocket service - you'll need to create this
import websocketService from "/Users/sn78/Downloads/Velink/frontend/src/services/websocket.js"

// Define interfaces for type safety
interface DetectedUrl {
  id: string
  url: string
  suspicious: boolean
  protocol: string
  timestamp?: string
}

export function NetworkCapture() {
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  const [captureTime, setCaptureTime] = useState<number>(0)
  const [packetsCaptured, setPacketsCaptured] = useState<number>(0)
  const [autoBlock, setAutoBlock] = useState<boolean>(true)
  const [detectedUrls, setDetectedUrls] = useState<DetectedUrl[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect()
    
    // Set up listener for URL updates from WebSocket
    const removeUrlListener = websocketService.onUrl((urlData: any) => {
      // Ensure urlData has all required properties
      const processedUrlData: DetectedUrl = {
        id: urlData.id || `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: urlData.url || "",
        suspicious: Boolean(urlData.suspicious),
        protocol: urlData.protocol || (urlData.url?.startsWith('https') ? 'HTTPS' : 'HTTP')
      }
      
      setDetectedUrls((prev) => [...prev, processedUrlData])
      setPacketsCaptured((prev) => prev + 1)
    })
    
    // Clean up on unmount
    return () => {
      removeUrlListener()
      websocketService.disconnect()
    }
  }, [])

  // Timer for capture duration
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    
    if (isCapturing) {
      timer = setInterval(() => {
        setCaptureTime((prev) => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isCapturing])

  // Start capture function using API
  const handleStartCapture = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await startCapture()
      if (response.status === "started") {
        setIsCapturing(true)
        setCaptureTime(0)
        setDetectedUrls([])
        setPacketsCaptured(0)
      }
    } catch (error) {
      console.error("Failed to start capture:", error)
      setError("Failed to start capture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Stop capture function using API
  const handleStopCapture = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await stopCapture();
      
      // Add a timeout to ensure we update the UI even if the backend is slow
      setTimeout(() => {
        setIsCapturing(false);
        setIsLoading(false);
      }, 3000); // 3 second timeout
      
    } catch (error) {
      console.error("Failed to stop capture:", error);
      setError("Failed to stop capture. Please try again.");
      
      // Force state change even on error
      setIsCapturing(false);
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className={`h-5 w-5 ${isCapturing ? "text-green-500" : "text-muted-foreground"}`} />
            Network Capture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Switch id="auto-block" checked={autoBlock} onCheckedChange={setAutoBlock} />
            <Label htmlFor="auto-block">Auto-block Malicious URLs</Label>
          </div>

          <div className="rounded-md border p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Capture Time</span>
              <div className="font-mono text-lg">{formatTime(captureTime)}</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Packets Captured</span>
              <span className="font-mono">{packetsCaptured.toLocaleString()}</span>
            </div>
          </div>

          {isCapturing ? (
            <Button 
              onClick={handleStopCapture} 
              className="bg-red-600 hover:bg-red-700 w-full"
              disabled={isLoading}
            >
              <Pause className="mr-2 h-4 w-4" />
              {isLoading ? "Processing..." : "Stop Capture"}
            </Button>
          ) : (
            <Button 
              onClick={handleStartCapture} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              {isLoading ? "Starting..." : "Start Capture"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Traffic</CardTitle>
        </CardHeader>
        <CardContent>
          {isCapturing ? (
            <div className="space-y-2">
              {detectedUrls.length > 0 ? (
                detectedUrls.slice(-3).map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`flex justify-between items-center p-2 rounded-md ${
                      item.suspicious
                        ? "bg-red-50 border border-red-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.suspicious ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                      <div className={`font-medium truncate max-w-[200px] ${
                        item.suspicious ? "text-red-700" : "text-green-700"
                      }`}>
                        {item.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        item.suspicious ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        {item.protocol}
                      </Badge>
                      <div className={`text-sm ${
                        item.suspicious ? "text-red-600" : "text-green-600"
                      }`}>
                        {item.suspicious ? "Blocked" : "Safe"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Scanning for suspicious URLs...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <WifiOff className="h-10 w-10 mb-2" />
              <h3 className="text-lg font-medium">No Active Capture</h3>
              <p className="text-sm">Start a network capture to see real-time URL analysis</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}