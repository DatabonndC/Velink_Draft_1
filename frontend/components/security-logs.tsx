// components/security-logs.tsx

"use client"

import { useState, useEffect } from "react"
import { Search, ShieldAlert, AlertTriangle, ShieldCheck, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDetectedUrls, getSuspiciousConnections } from "/Users/sn78/Downloads/Velink/frontend/src/services/api.js"

export function SecurityLogs() {
  const [securityLogs, setSecurityLogs] = useState<any[]>([])
  const [filteredLogs, setFilteredLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Fetch logs when component mounts
  useEffect(() => {
    fetchSecurityLogs()
  }, [])

  // Handle search and filter changes
  useEffect(() => {
    filterLogs()
  }, [searchTerm, filterType, securityLogs])

  const fetchSecurityLogs = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      // Fetch URLs and suspicious connections from the API
      const [urlsResponse, suspiciousResponse] = await Promise.all([
        getDetectedUrls(),
        getSuspiciousConnections()
      ])
      
      // Process URL data
      const urlLogs = (urlsResponse?.urls || []).map((url: any) => ({
        id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: url.timestamp || new Date().toISOString().replace("T", " ").substring(0, 19),
        url: url.url,
        threatLevel: url.suspicious ? "high" : "safe",
        action: url.suspicious ? "blocked" : "allowed",
        source: url.source_ip || "Unknown",
        protocol: url.protocol || "Unknown",
        details: url.details || ""
      }))
      
      // Process suspicious connections
      const suspiciousLogs = (suspiciousResponse?.connections || []).map((conn: any) => ({
        id: `susp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: conn.timestamp || new Date().toISOString().replace("T", " ").substring(0, 19),
        url: conn.url,
        threatLevel: conn.threat_level || "medium",
        action: "blocked",
        source: conn.source_ip || "Unknown",
        protocol: conn.protocol || "Unknown",
        details: conn.details || "Suspicious connection detected"
      }))
      
      // Combine and sort by timestamp (newest first)
      const combinedLogs = [...urlLogs, ...suspiciousLogs].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      
      setSecurityLogs(combinedLogs)
      setFilteredLogs(combinedLogs)
    } catch (error) {
      console.error("Failed to fetch security logs:", error)
      setError("Failed to load security logs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = [...securityLogs]
    
    // Apply threat level filter
    if (filterType !== "all") {
      filtered = filtered.filter(log => log.threatLevel === filterType)
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.url.toLowerCase().includes(term) || 
        log.source.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term)
      )
    }
    
    setFilteredLogs(filtered)
  }

  const getThreatIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "low":
        return <Info className="h-4 w-4 text-blue-500" />
      case "safe":
        return <ShieldCheck className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (level: string) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          Security Logs
        </CardTitle>
        <Button 
          className="outline text-sm" 
          onClick={fetchSecurityLogs}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by URL or IP..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Select
            value={filterType}
            onValueChange={setFilterType}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by threat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Threats</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Threat</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Source IP</TableHead>
                <TableHead>Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading security logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        {getThreatIcon(log.threatLevel)}
                        <span className="truncate">{log.url}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(log.threatLevel)}>
                        {log.threatLevel.charAt(0).toUpperCase() + log.threatLevel.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`
                          ${log.action === "blocked" ? "bg-red-50 text-red-700 border-red-200" : ""}
                          ${log.action === "allowed" ? "bg-green-50 text-green-700 border-green-200" : ""}
                          ${log.action === "warned" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
                          border
                        `}
                      >
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.source}</TableCell>
                    <TableCell className="font-mono text-xs">{log.protocol}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm || filterType !== "all" ? (
                      <div>
                        <p className="text-muted-foreground">No logs match your filters</p>
                          <Button 
                          className="text-blue-500 hover:text-blue-700 p-0 underline" 
                          onClick={() => {
                            setSearchTerm("")
                            setFilterType("all")
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No security logs found. Start a network capture to generate logs.
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground text-right">
          {filteredLogs.length > 0 && (
            <span>Showing {filteredLogs.length} of {securityLogs.length} logs</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}