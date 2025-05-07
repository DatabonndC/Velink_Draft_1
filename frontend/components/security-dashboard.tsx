"use client"

import { useState, useEffect, useRef } from "react"
import {
  Play,
  Pause,
  Shield,
  LogOut,
  Menu,
  Wifi,
  FileText,
  HelpCircle,
  RefreshCw,
  Save,
  Clock,
  AlertTriangle,
  ShieldCheck,
  WifiOff,
  Download,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserGuide } from "@/components/user-guide"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Firebase imports
import { getFirestore, collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy, limit, where, Timestamp, getDocs } from "firebase/firestore"
import { getDatabase, ref, onValue, off } from "firebase/database"
import { getAuth, signOut } from "firebase/auth"

// Import from firebase.js using relative path
import { app, auth, db, rtdb } from "../src/services/firebase.js"

// Note: We're importing the initialized Firebase services directly from firebase.js
// instead of initializing them again here

// Define types for type safety
interface SecurityLog {
  id: string
  timestamp: string
  url: string
  threatLevel: "critical" | "high" | "medium" | "low" | "safe"
  action: "blocked" | "allowed" | "warned"
  source: string
  details?: string
  isSummary?: boolean
  captureData?: {
    packetsCaptured: number
    captureTime: number
    detectedUrls: number
    criticalThreats: number
    highThreats: number
    mediumThreats: number
  }
  threatDetails?: {
    type: string
    description: string
    recommendation: string
    detectedAt: string
    ipAddress: string
    method?: string
    payload?: string
  }
}

interface DetectedUrl {
  id?: string
  url: string
  suspicious: boolean
  protocol?: string
  source_ip?: string
  timestamp?: string
}

interface CaptureSession {
  id?: string
  startTime: string
  endTime?: string
  status: "running" | "completed" | "failed"
  userId: string
  settings?: {
    interface?: string
    filter?: string
    deepInspection?: boolean
  }
}

export function SecurityDashboard() {
  // State variables with proper typing
  const [isCapturing, setIsCapturing] = useState<boolean>(false)
  const [captureTime, setCaptureTime] = useState<number>(0)
  const [captureInterface, setCaptureInterface] = useState<string>("eth0")
  const [captureFilter, setCaptureFilter] = useState<string>("http")
  const [deepInspection, setDeepInspection] = useState<boolean>(true)
  const [packetsCaptured, setPacketsCaptured] = useState<number>(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("capture")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Detected URLs during capture
  const [detectedUrls, setDetectedUrls] = useState<DetectedUrl[]>([])

  // Connect to Firebase when component mounts
  useEffect(() => {
    // Listen for security logs from Firestore
    const logsRef = collection(db, "securityLogs")
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(20))
    
    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const logs: SecurityLog[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          timestamp: data.timestamp || new Date().toISOString(),
          url: data.url || "",
          threatLevel: data.threatLevel || "safe",
          action: data.action || "allowed",
          source: data.source || "unknown",
          details: data.details,
          isSummary: data.isSummary || false,
          captureData: data.captureData,
          threatDetails: data.threatDetails
        })
      })
      
      setSecurityLogs(logs)
    }, (error) => {
      console.error("Error fetching security logs:", error)
      setError("Failed to load security logs. Please try again.")
    })
    
    // Listen for real-time URL updates during capture
    const setupUrlListener = () => {
      if (!isCapturing || !currentSessionId) return null
      
      const urlsRef = collection(db, "detectedUrls")
      const urlsQuery = query(urlsRef, where("sessionId", "==", currentSessionId), orderBy("timestamp", "desc"))
      
      return onSnapshot(urlsQuery, (snapshot) => {
        const urls: DetectedUrl[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          urls.push({
            id: doc.id,
            url: data.url || "",
            suspicious: Boolean(data.suspicious),
            protocol: data.protocol || (data.url?.startsWith('https') ? 'HTTPS' : 'HTTP'),
            source_ip: data.source_ip,
            timestamp: data.timestamp
          })
        })
        
        if (urls.length > 0) {
          setDetectedUrls(urls)
          setPacketsCaptured(urls.length)
        }
      }, (error) => {
        console.error("Error fetching URLs:", error)
      })
    }
    
    // Setup real-time URL listener when capturing starts
    const urlUnsubscribe = setupUrlListener()
    
    // Initial data load
    const loadInitialData = async () => {
      try {
        // Get active capture session if any
        const sessionsRef = collection(db, "captureSessions")
        const activeSessionQuery = query(
          sessionsRef, 
          where("status", "==", "running"),
          where("userId", "==", auth.currentUser?.uid || "anonymous"),
          orderBy("startTime", "desc"),
          limit(1)
        )
        
        const sessionSnapshot = await getDocs(activeSessionQuery)
        
        if (!sessionSnapshot.empty) {
          const sessionDoc = sessionSnapshot.docs[0]
          const sessionData = sessionDoc.data() as CaptureSession
          
          setCurrentSessionId(sessionDoc.id)
          setIsCapturing(true)
          
          // Calculate elapsed time
          const startTime = new Date(sessionData.startTime).getTime()
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000)
          setCaptureTime(elapsedSeconds)
          
          // Set capture settings if available
          if (sessionData.settings) {
            sessionData.settings.interface && setCaptureInterface(sessionData.settings.interface)
            sessionData.settings.filter && setCaptureFilter(sessionData.settings.filter)
            sessionData.settings.deepInspection !== undefined && setDeepInspection(sessionData.settings.deepInspection)
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error)
      }
    }
    
    loadInitialData()
    
    // Clean up listeners on unmount
    return () => {
      unsubscribeLogs()
      urlUnsubscribe && urlUnsubscribe()
    }
  }, [isCapturing, currentSessionId])

  // Timer for capture duration
  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isCapturing) {
      timer = setInterval(() => {
        setCaptureTime((prev) => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isCapturing])

  // Auto-stop capture after 30 seconds
  useEffect(() => {
    if (isCapturing && captureTime >= 30) {
      stopNetworkCapture()
      generateSecurityReport()
    }
  }, [captureTime, isCapturing])

  // Start capture function
  const startNetworkCapture = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Create a new capture session in Firestore
      const session: Omit<CaptureSession, "id"> = {
        startTime: new Date().toISOString(),
        status: "running",
        userId: auth.currentUser?.uid || "anonymous",
        settings: {
          interface: captureInterface,
          filter: captureFilter,
          deepInspection: deepInspection
        }
      }
      
      const sessionRef = await addDoc(collection(db, "captureSessions"), session)
      setCurrentSessionId(sessionRef.id)
      
      // Start simulating network traffic for demo purposes
      simulateNetworkTraffic(sessionRef.id)
      
      setIsCapturing(true)
      setCaptureTime(0)
      setDetectedUrls([])
      setPacketsCaptured(0)
    } catch (error) {
      console.error("Failed to start capture:", error)
      setError("Failed to start capture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Stop capture function
  const stopNetworkCapture = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      if (!currentSessionId) {
        throw new Error("No active capture session")
      }
      
      // Update the session in Firestore
      const sessionRef = doc(db, "captureSessions", currentSessionId)
      await updateDoc(sessionRef, {
        endTime: new Date().toISOString(),
        status: "completed"
      })
      
      setIsCapturing(false)
    } catch (error) {
      console.error("Failed to stop capture:", error)
      setError("Failed to stop capture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); // Reload to show login screen
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to log out. Please try again.");
    }
  };
  
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const resetCapture = () => {
    if (!isCapturing) {
      setCaptureTime(0)
      setPacketsCaptured(0)
      setDetectedUrls([])
    }
  }

  // Generate security report from capture session
  const generateSecurityReport = async () => {
    try {
      if (!currentSessionId) return
      
      // Get all URLs detected in this session
      const urlsRef = collection(db, "detectedUrls")
      const urlsQuery = query(
        urlsRef, 
        where("sessionId", "==", currentSessionId)
      )
      
      const urlsSnapshot = await getDocs(urlsQuery)
      const urls: DetectedUrl[] = []
      
      urlsSnapshot.forEach((doc) => {
        urls.push({ id: doc.id, ...doc.data() as DetectedUrl })
      })
      
      const now = new Date()
      const timestamp = now.toISOString()
      
      // Count threats by severity
      const suspiciousUrls = urls.filter(url => url.suspicious)
      
      // Create a summary log
      const summaryLog: Omit<SecurityLog, "id"> = {
        timestamp,
        url: "Capture Session Summary",
        threatLevel: suspiciousUrls.length > 0 ? "high" : "low",
        action: "blocked",
        source: captureInterface,
        isSummary: true,
        captureData: {
          packetsCaptured,
          captureTime,
          detectedUrls: urls.length,
          criticalThreats: 0,
          highThreats: suspiciousUrls.length,
          mediumThreats: 0,
        },
      }
      
      // Save to Firestore
      await addDoc(collection(db, "securityLogs"), summaryLog)
      
      // Create logs for each URL
      for (const url of urls) {
        const logData: Omit<SecurityLog, "id"> = {
          timestamp: url.timestamp || timestamp,
          url: url.url,
          threatLevel: url.suspicious ? "high" : "safe",
          action: url.suspicious ? "blocked" : "allowed",
          source: url.source_ip || "192.168.1.1",
          threatDetails: url.suspicious ? {
            type: "Suspicious URL",
            description: "This URL shows characteristics of a potential threat",
            recommendation: "Block access and scan affected devices for malware",
            detectedAt: url.timestamp || timestamp,
            ipAddress: url.source_ip || "192.168.1.1",
            method: "GET"
          } : undefined
        }
        
        await addDoc(collection(db, "securityLogs"), logData)
      }
      
      // Switch to logs tab to show the report
      setActiveTab("logs")
    } catch (error) {
      console.error("Error generating report:", error)
    }
  }

  // For demo purposes - simulates network traffic
  const simulateNetworkTraffic = (sessionId: string) => {
    const demoUrls = [
      { url: "https://example.com/login", suspicious: false, protocol: "HTTPS" },
      { url: "http://malware-example.net/download", suspicious: true, protocol: "HTTP" },
      { url: "https://banking-secure.com", suspicious: false, protocol: "HTTPS" },
      { url: "http://phishing-example.com", suspicious: true, protocol: "HTTP" },
      { url: "https://legitimate-site.org", suspicious: false, protocol: "HTTPS" }
    ]
    
    // Simulate detecting a URL every few seconds
    let urlIndex = 0
    const interval = setInterval(async () => {
      if (!isCapturing || urlIndex >= demoUrls.length) {
        clearInterval(interval)
        return
      }
      
      const urlData = {
        ...demoUrls[urlIndex],
        sessionId,
        timestamp: new Date().toISOString(),
        source_ip: "192.168.1.5"
      }
      
      try {
        // Add to Firestore
        await addDoc(collection(db, "detectedUrls"), urlData)
      } catch (error) {
        console.error("Error adding simulated URL:", error)
      }
      
      urlIndex++
    }, 3000)
    
    // Store reference to clear on unmount if needed
    captureIntervalRef.current = interval
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get threat badge color
  const getThreatBadge = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "low":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "safe":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Get threat icon
  const getThreatIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "low":
        return <Shield className="h-5 w-5 text-blue-500" />
      case "safe":
        return <ShieldCheck className="h-5 w-5 text-green-500" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <ShieldCheck className="h-6 w-6 text-purple-600" />
          <span className="font-bold">Velink</span>
        </div>
        <Button onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r w-64 flex-shrink-0 transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static h-[calc(100vh-4rem)] z-10`}
        >
          <div className="p-4">
            <div className="space-y-1">
              <Button
                className={`w-full justify-start ${activeTab === "capture" ? "bg-secondary text-secondary-foreground" : "bg-ghost text-ghost-foreground"}`}
                onClick={() => setActiveTab("capture")}
              >
                <Wifi className="mr-2 h-4 w-4" />
                Network Capture
              </Button>
              <Button
                className={`w-full justify-start ${activeTab === "logs" ? "bg-secondary text-secondary-foreground" : "bg-ghost text-ghost-foreground"}`}
                onClick={() => setActiveTab("logs")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Security Logs
              </Button>
              <Button
                className={`w-full justify-start ${activeTab === "guide" ? "bg-secondary text-secondary-foreground" : "bg-ghost text-ghost-foreground"}`}
                onClick={() => setActiveTab("guide")}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                User Guide
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {activeTab === "capture" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wifi className={`h-5 w-5 ${isCapturing ? "text-green-500" : "text-muted-foreground"}`} />
                      Network Capture Control
                    </CardTitle>
                    <CardDescription>Capture and analyze network traffic for malicious URLs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm mb-4">
                        {error}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="interface">Capture Interface</Label>
                        <Select 
                          value={captureInterface} 
                          onValueChange={setCaptureInterface}
                          disabled={isCapturing}
                        >
                          <SelectTrigger id="interface">
                            <SelectValue placeholder="Select interface" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eth0">eth0 (Ethernet)</SelectItem>
                            <SelectItem value="wlan0">wlan0 (WiFi)</SelectItem>
                            <SelectItem value="lo">lo (Loopback)</SelectItem>
                            <SelectItem value="all">All Interfaces</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="filter">Protocol Filter</Label>
                        <Select 
                          value={captureFilter} 
                          onValueChange={setCaptureFilter}
                          disabled={isCapturing}
                        >
                          <SelectTrigger id="filter">
                            <SelectValue placeholder="Select filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="http">HTTP/HTTPS</SelectItem>
                            <SelectItem value="dns">DNS</SelectItem>
                            <SelectItem value="tcp">TCP</SelectItem>
                            <SelectItem value="all">All Traffic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="deep-inspection" 
                        checked={deepInspection} 
                        onCheckedChange={setDeepInspection}
                        disabled={isCapturing}
                      />
                      <Label htmlFor="deep-inspection">Deep Packet Inspection</Label>
                    </div>

                    <div className="rounded-md border p-4 bg-gray-50">
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Capture Time</span>
                          </div>
                          <div className="font-mono text-lg">{formatTime(captureTime)}</div>
                        </div>
                        <Progress value={Math.min((captureTime / 30) * 100, 100)} className="h-2" />
                        {isCapturing && captureTime < 30 && (
                          <div className="text-xs text-right text-muted-foreground mt-1">
                            Auto-stop in {30 - captureTime}s
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Packets Captured</span>
                        <span className="font-mono">{packetsCaptured.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {!isCapturing ? (
                      <Button 
                        onClick={startNetworkCapture} 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isLoading ? "Starting..." : "Start Capture"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopNetworkCapture} 
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading}
                      >
                        <Pause className="mr-2 h-4 w-4" />
                        {isLoading ? "Stopping..." : "Stop Capture"}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button className="outline" onClick={resetCapture} disabled={isCapturing}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                      <Button className="outline" disabled={packetsCaptured === 0}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Live Traffic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isCapturing ? (
                      <div className="space-y-2">
                        {detectedUrls.length > 0 ? (
                          detectedUrls.slice(0, 5).map((item, index) => (
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
                                  {item.protocol || "HTTP"}
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
            )}

            {activeTab === "logs" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    Security Logs
                  </CardTitle>
                  <CardDescription className="text-center">
                    History of detected threats and capture sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityLogs.length > 0 ? (
                      securityLogs.map((log) => (
                        <Collapsible
                          key={log.id}
                          open={expandedLogId === log.id}
                          onOpenChange={() => {
                            setExpandedLogId(expandedLogId === log.id ? null : log.id)
                          }}
                          className={`rounded-md border ${
                            log.isSummary
                              ? log.threatLevel === "critical"
                                ? "bg-red-50 border-red-300"
                                : log.threatLevel === "high"
                                  ? "bg-red-50 border-red-200"
                                  : log.threatLevel === "medium"
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                        >
                          <CollapsibleTrigger className="w-full text-left p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getThreatIcon(log.threatLevel)}
                                <div>
                                  <div className="font-medium">
                                    {log.isSummary ? (
                                      <span className="text-lg">
                                        {log.captureData?.criticalThreats ? (
                                          <span className="text-red-700 font-bold">CRITICAL THREAT ALERT</span>
                                        ) : log.captureData?.highThreats ? (
                                          <span className="text-red-700 font-bold">HIGH RISK ALERT</span>
                                        ) : log.captureData?.mediumThreats ? (
                                          <span className="text-amber-700 font-bold">SECURITY ALERT</span>
                                        ) : (
                                          <span>Capture Session Complete</span>
                                        )}
                                      </span>
                                    ) : (
                                      log.url
                                    )}
                                  </div>
                                  {!log.isSummary && (
                                    <div className="text-sm text-muted-foreground">
                                      {log.threatLevel.charAt(0).toUpperCase() + log.threatLevel.slice(1)} -{" "}
                                      {log.timestamp}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {log.isSummary ? (
                                  <div className="flex items-center gap-1 text-sm">
                                    <span className="font-medium">
                                      {log.captureData?.detectedUrls || 0} URLs detected
                                    </span>
                                  </div>
                                ) : (
                                  <Badge className={`outline ${getThreatBadge(log.threatLevel)}`}>
                                    {log.threatLevel.charAt(0).toUpperCase() + log.threatLevel.slice(1)}
                                  </Badge>
                                )}
                                {expandedLogId === log.id ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {log.isSummary ? (
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Capture Duration</div>
                                    <div className="font-medium">{formatTime(log.captureData?.captureTime || 0)}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Packets Captured</div>
                                    <div className="font-medium">{log.captureData?.packetsCaptured.toLocaleString() || 0}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">URLs Detected</div>
                                    <div className="font-medium">{log.captureData?.detectedUrls || 0}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Threats Blocked</div>
                                    <div className="font-medium">
                                      {((log.captureData?.criticalThreats || 0) + 
                                        (log.captureData?.highThreats || 0) + 
                                        (log.captureData?.mediumThreats || 0)) || 0}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground">Threat Breakdown</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-600"></span>
                                        <span className="text-sm">Critical</span>
                                      </div>
                                      <span className="text-sm font-medium">{log.captureData?.criticalThreats || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                        <span className="text-sm">High</span>
                                      </div>
                                      <span className="text-sm font-medium">{log.captureData?.highThreats || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                        <span className="text-sm">Medium</span>
                                      </div>
                                      <span className="text-sm font-medium">{log.captureData?.mediumThreats || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 space-y-3">
                                {log.threatDetails && (
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground">Threat Details</div>
                                    <div className="rounded-md bg-gray-50 p-3 space-y-2">
                                      <div>
                                        <span className="text-sm font-medium">Type: </span>
                                        <span className="text-sm">{log.threatDetails.type}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Description: </span>
                                        <span className="text-sm">{log.threatDetails.description}</span>
                                      </div>
                                      <div>
                                        <span className="text-sm font-medium">Recommendation: </span>
                                        <span className="text-sm">{log.threatDetails.recommendation}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="text-sm font-medium text-muted-foreground">Connection Information</div>
                                  <div className="rounded-md bg-gray-50 p-3 space-y-2">
                                    <div>
                                      <span className="text-sm font-medium">URL: </span>
                                      <span className="text-sm font-mono">{log.url}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">Source IP: </span>
                                      <span className="text-sm font-mono">{log.source}</span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">Detected At: </span>
                                      <span className="text-sm font-mono">{log.timestamp}</span>
                                    </div>
                                    {log.threatDetails?.method && (
                                      <div>
                                        <span className="text-sm font-medium">Method: </span>
                                        <span className="text-sm font-mono">{log.threatDetails.method}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => {
                                      // For demo purposes, we'll just show an alert
                                      // In a real app, this would open more detailed information
                                      alert(`More details for ${log.url}`);
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View Full Details
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No security logs found</p>
                        <p className="text-sm mt-1">Start a network capture to generate logs</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Logs
                  </Button>
                </CardFooter>
              </Card>
            )}

            {activeTab === "guide" && <UserGuide />}
          </div>
        </main>
      </div>
    </div>
  )
}