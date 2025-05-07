// components/threat-overview.tsx

"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDetectedUrls, getSuspiciousConnections } from "/Users/sn78/Downloads/Velink/frontend/src/services/api.js"

export function ThreatOverview() {
  const [stats, setStats] = useState({
    threatsDetected: 0,
    urlsScanned: 0
  })
  const [recentThreats, setRecentThreats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const urlsResponse = await getDetectedUrls()
        const suspiciousResponse = await getSuspiciousConnections()
        
        // Extract data
        const urls = urlsResponse.urls || []
        const suspiciousConnections = suspiciousResponse.connections || []
        
        // Calculate stats
        const threatsCount = urls.filter((url: any) => url.suspicious).length + suspiciousConnections.length
        
        setStats({
          threatsDetected: threatsCount,
          urlsScanned: urls.length
        })
        
        // Get recent threats
        const allThreats = [
          ...urls.filter((url: any) => url.suspicious).map((url: any) => ({
            url: url.url,
            riskLevel: "High Risk"
          })),
          ...suspiciousConnections.map((conn: any) => ({
            url: conn.url,
            riskLevel: conn.threat_level === "critical" ? "Critical Risk" : 
                      conn.threat_level === "high" ? "High Risk" : "Medium Risk"
          }))
        ]
        
        // Sort by recency (assuming most recent are first in the API response)
        setRecentThreats(allThreats.slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch threat overview data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
          <ShieldAlert className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.threatsDetected}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">URLs Scanned</CardTitle>
          <ShieldCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "..." : stats.urlsScanned}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Threats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>Loading recent threats...</p>
            </div>
          ) : recentThreats.length > 0 ? (
            <div className="space-y-2">
              {recentThreats.map((threat, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between items-center p-2 rounded-md ${
                    threat.riskLevel === "Critical Risk" ? "bg-red-100 border border-red-300" :
                    threat.riskLevel === "High Risk" ? "bg-red-50 border border-red-200" :
                    "bg-amber-50 border border-amber-200"
                  }`}
                >
                  <div className={`font-medium ${
                    threat.riskLevel === "Critical Risk" ? "text-red-800" :
                    threat.riskLevel === "High Risk" ? "text-red-700" :
                    "text-amber-700"
                  }`}>
                    {threat.url}
                  </div>
                  <div className={`text-sm ${
                    threat.riskLevel === "Critical Risk" ? "text-red-800" :
                    threat.riskLevel === "High Risk" ? "text-red-600" :
                    "text-amber-600"
                  }`}>
                    {threat.riskLevel}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>No recent threats detected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}