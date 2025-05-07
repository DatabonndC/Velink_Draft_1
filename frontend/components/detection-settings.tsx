// components/detection-settings.tsx

"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Info, Save, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// In a real application, you would create API functions for settings
// import { getSettings, updateSettings } from "../services/api"

export function DetectionSettings() {
  const [sensitivityLevel, setSensitivityLevel] = useState([75])
  const [autoBlock, setAutoBlock] = useState(true)
  const [deepInspection, setDeepInspection] = useState(true)
  const [scanJavaScript, setScanJavaScript] = useState(true)
  const [scanDownloads, setScanDownloads] = useState(true)
  const [scanEmails, setScanEmails] = useState(false)
  const [whitelistedDomains, setWhitelistedDomains] = useState("example.com\ncompany-domain.com")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Simulate loading settings from API
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        // In a real application, you would fetch settings from the backend
        // const settings = await getSettings()
        // setSensitivityLevel([settings.sensitivityLevel])
        // setAutoBlock(settings.autoBlock)
        // etc.
        
        // For now, simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would save settings to the backend
      // await updateSettings({
      //   sensitivityLevel: sensitivityLevel[0],
      //   autoBlock,
      //   deepInspection,
      //   scanJavaScript,
      //   scanDownloads,
      //   scanEmails,
      //   whitelistedDomains: whitelistedDomains.split('\n')
      // })
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Show saved confirmation
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Changing detection settings may affect system performance and security. Proceed with caution.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Detection Configuration
          </CardTitle>
          <CardDescription>Configure how the system detects and responds to malicious URLs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sensitivity" className="text-base">
                  Detection Sensitivity
                </Label>
                <p className="text-sm text-muted-foreground">
                  Adjust how aggressively the system flags suspicious URLs
                </p>
              </div>
              <span className="font-medium">{sensitivityLevel}%</span>
            </div>
            <Slider
              id="sensitivity"
              value={sensitivityLevel}
              onValueChange={setSensitivityLevel}
              max={100}
              step={1}
              className="w-full"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Less Sensitive</span>
              <span>More Sensitive</span>
            </div>
          </div>

          <div className="grid gap-6 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Automatic Blocking</Label>
                <p className="text-sm text-muted-foreground">Automatically block access to detected malicious URLs</p>
              </div>
              <Switch checked={autoBlock} onCheckedChange={setAutoBlock} disabled={isLoading} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label className="text-base">Deep Packet Inspection</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[200px] text-xs">
                          Analyzes packet contents for malicious patterns. May impact performance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">Inspect packet contents for malicious patterns</p>
              </div>
              <Switch checked={deepInspection} onCheckedChange={setDeepInspection} disabled={isLoading} />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced">
              <AccordionTrigger>Advanced Settings</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scan JavaScript Content</Label>
                    <p className="text-sm text-muted-foreground">Analyze JavaScript for malicious code</p>
                  </div>
                  <Switch checked={scanJavaScript} onCheckedChange={setScanJavaScript} disabled={isLoading} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scan Downloads</Label>
                    <p className="text-sm text-muted-foreground">Scan downloaded files for malware</p>
                  </div>
                  <Switch checked={scanDownloads} onCheckedChange={setScanDownloads} disabled={isLoading} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scan Email Links</Label>
                    <p className="text-sm text-muted-foreground">Scan links in emails for phishing attempts</p>
                  </div>
                  <Switch checked={scanEmails} onCheckedChange={setScanEmails} disabled={isLoading} />
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="whitelist">Whitelisted Domains</Label>
                  <p className="text-sm text-muted-foreground">Enter domains to exclude from scanning (one per line)</p>
                  <Textarea
                    id="whitelist"
                    value={whitelistedDomains}
                    onChange={(e) => setWhitelistedDomains(e.target.value)}
                    placeholder="example.com"
                    className="font-mono text-sm"
                    rows={5}
                    disabled={isLoading}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          {isSaved && (
            <div className="mr-auto text-sm text-green-600">
              Settings saved successfully!
            </div>
          )}
          <Button onClick={handleSave} className="ml-auto" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}