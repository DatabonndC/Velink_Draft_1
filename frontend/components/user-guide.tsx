import { AlertTriangle, CheckCircle, HelpCircle, Play } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function UserGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            User Guide
          </CardTitle>
          <CardDescription>Learn how to use the Malware URL Detector to protect your network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Getting Started</h3>
            <p className="text-muted-foreground">
              The Malware URL Detector helps you identify and block malicious websites and URLs in your network traffic.
              Follow these simple steps to get started:
            </p>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Navigate to Network Capture</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the sidebar to navigate to the Network Capture section.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Start Capturing</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the{" "}
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      <Play className="h-3 w-3 mr-1" /> Start Capture
                    </span>{" "}
                    button to begin monitoring network traffic.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Review Detected Threats</h4>
                  <p className="text-sm text-muted-foreground">
                    The system will automatically detect and display potentially malicious URLs.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-bold text-blue-700">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Check Security Logs</h4>
                  <p className="text-sm text-muted-foreground">
                    Navigate to the Security Logs section to view a history of all detected threats.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Understanding Threat Levels</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 mt-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700">High Risk</p>
                      <p className="text-sm text-muted-foreground">
                        Known malicious URLs that contain malware, phishing attempts, or other serious threats. These
                        are automatically blocked.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">Medium Risk</p>
                      <p className="text-sm text-muted-foreground">
                        Suspicious URLs that show some characteristics of malicious content but aren't confirmed
                        threats.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700">Safe</p>
                      <p className="text-sm text-muted-foreground">
                        URLs that have been scanned and determined to be safe.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 mt-2">
                  <div>
                    <p className="font-medium">How does the URL detection work?</p>
                    <p className="text-sm text-muted-foreground">
                      The system analyzes network traffic in real-time, comparing URLs against a database of known
                      threats and using pattern recognition to identify suspicious characteristics.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Will this slow down my network?</p>
                    <p className="text-sm text-muted-foreground">
                      The detector is designed to be lightweight and efficient, with minimal impact on network
                      performance.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">What should I do if a malicious URL is detected?</p>
                    <p className="text-sm text-muted-foreground">
                      The system automatically blocks high-risk URLs. For medium-risk URLs, you can manually review them
                      in the Security Logs section.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Tips for Better Security</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-2 mt-2 text-sm text-muted-foreground">
                  <li>Run regular network captures to monitor for threats</li>
                  <li>Review security logs daily to identify patterns</li>
                  <li>Keep the detector software updated for the latest threat definitions</li>
                  <li>Combine with other security measures like firewalls and antivirus software</li>
                  <li>Educate users about phishing and malicious websites</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
