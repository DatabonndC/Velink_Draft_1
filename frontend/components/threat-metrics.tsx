// components/threat-metrics.tsx

"use client"

import { useState, useEffect } from "react"
import { BarChart3, Globe, Info, PieChart, Shield, ShieldAlert, ShieldCheck, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDetectedUrls, getSuspiciousConnections } from "/Users/sn78/Downloads/Velink/frontend/src/services/api.js"

export function ThreatMetrics() {
  const [timeRange, setTimeRange] = useState("24h")
  const [metrics, setMetrics] = useState({
    totalThreats: 0,
    maliciousUrlsBlocked: 0,
    safeUrlsProcessed: 0,
    detectionRate: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch metrics data when component mounts or timeRange changes
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true)
      try {
        const urlsResponse = await getDetectedUrls()
        const suspiciousResponse = await getSuspiciousConnections()
        
        // Extract data
        const urls = urlsResponse.urls || []
        const suspiciousConnections = suspiciousResponse.connections || []
        
        // Calculate metrics
        const safeUrls = urls.filter((url: any) => !url.suspicious).length
        const maliciousUrls = urls.filter((url: any) => url.suspicious).length + suspiciousConnections.length
        const totalUrls = safeUrls + maliciousUrls
        
        // Update state
        setMetrics({
          totalThreats: maliciousUrls,
          maliciousUrlsBlocked: maliciousUrls,
          safeUrlsProcessed: safeUrls,
          detectionRate: totalUrls > 0 ? (maliciousUrls / totalUrls) * 100 : 0
        })
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMetrics()
  }, [timeRange])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Threats Detected</CardTitle>
          <ShieldAlert className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.totalThreats.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+24% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Malicious URLs Blocked</CardTitle>
          <Shield className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.maliciousUrlsBlocked.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+12% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Safe URLs Processed</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.safeUrlsProcessed.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+8% from last week</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threat Detection Rate</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : metrics.detectionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">+0.5% from last week</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center">
          <div className="flex-1">
            <CardTitle>Threat Analysis</CardTitle>
            <CardDescription>Overview of detected threats and their categories</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
                {isLoading ? (
                  <div className="text-center">
                    <p className="text-muted-foreground">Loading threat data...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Threat distribution chart</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Visualization showing phishing, malware, ransomware distribution)
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="categories" className="pt-4">
              <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Threat categories chart</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Bar chart showing distribution by threat category)
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="sources" className="pt-4">
              <div className="h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="text-center">
                  <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Threat sources map</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (World map showing geographic distribution of threats)
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button className="outline">
            <Info className="mr-2 h-4 w-4" />
            View Detailed Report
          </Button>
          <Button className="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}