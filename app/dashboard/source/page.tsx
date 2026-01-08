"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, LinkIcon, RefreshCw, Trash2, Chrome } from "lucide-react"

const mockSources = [
  {
    id: "1",
    name: "Google Drive",
    type: "google-drive",
    icon: "📁",
    status: "active",
    documents: 23,
    lastSynced: "1h ago",
    nextSync: "in 30 minutes",
  },
  {
    id: "2",
    name: "Company Wiki",
    type: "notion",
    icon: "📝",
    status: "active",
    documents: 156,
    lastSynced: "3h ago",
    nextSync: "in 2 hours",
  },
  {
    id: "3",
    name: "Company Website",
    type: "website",
    icon: "🌐",
    status: "active",
    documents: 45,
    lastSynced: "1d ago",
    nextSync: "in 1 day",
  },
]

const availableSources = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "📁",
    description: "Connect your Google Drive documents and folders",
    status: "connected",
  },
  {
    id: "notion",
    name: "Notion",
    icon: "📝",
    description: "Sync your Notion workspace pages and databases",
    status: "connected",
  },
  {
    id: "website",
    name: "Website Scraper",
    icon: "🌐",
    description: "Crawl and index your company website",
    status: "connected",
  },
  {
    id: "upload",
    name: "Upload Documents",
    icon: "📄",
    description: "Upload past proposals and documents",
    status: "available",
  },
]

export default function SourcesPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState<string | null>(null)
  const [googleDriveConfig, setGoogleDriveConfig] = useState({
    maxPages: 100,
    crawlDepth: 3,
  })
  const [websiteConfig, setWebsiteConfig] = useState({
    url: "https://www.example.com",
    maxPages: 50,
    crawlDepth: 2,
  })

  return (<>

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Connected Sources</h1>
              <p className="text-muted-foreground">Manage your knowledge sources for AI-powered answers</p>
            </div>

            {/* Action Button */}
            <div className="mb-8">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect New Source
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>Connect a Knowledge Source</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {availableSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => setSelectedSource(source.id)}
                          className={`p-6 rounded-lg border-2 text-left transition-all ${
                            selectedSource === source.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <div className="text-3xl mb-3">{source.icon}</div>
                          <h3 className="font-semibold text-foreground mb-1">{source.name}</h3>
                          <p className="text-sm text-muted-foreground">{source.description}</p>
                          {source.status === "connected" && (
                            <Badge className="mt-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Connected
                            </Badge>
                          )}
                        </button>
                      ))}
                    </div>

                    {selectedSource && (
                      <div className="mt-6 p-6 border border-border rounded-lg bg-muted/50 space-y-4">
                        <h3 className="font-semibold text-foreground">Configure {selectedSource}</h3>

                        {selectedSource === "google-drive" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Select Folders</Label>
                              <Button variant="outline" className="w-full justify-start bg-transparent">
                                Choose folders from Google Drive
                              </Button>
                            </div>

                            <div className="space-y-2">
                              <Label>File Types</Label>
                              <div className="grid grid-cols-2 gap-3">
                                {["PDF", "DOCX", "XLSX", "PPTX"].map((type) => (
                                  <label key={type} className="flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="rounded" />
                                    <span className="text-sm text-foreground">{type}</span>
                                  </label>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Auto-sync Frequency</Label>
                              <Select defaultValue="hourly">
                                <SelectTrigger className="bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hourly">Every hour</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="manual">Manual only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {selectedSource === "website" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="url">Website URL</Label>
                              <Input
                                id="url"
                                value={websiteConfig.url}
                                onChange={(e) => setWebsiteConfig({ ...websiteConfig, url: e.target.value })}
                                placeholder="https://www.example.com"
                                className="bg-background"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Max Pages to Crawl: {websiteConfig.maxPages}</Label>
                              <Slider
                                value={[websiteConfig.maxPages]}
                                onValueChange={(value) => setWebsiteConfig({ ...websiteConfig, maxPages: value[0] })}
                                min={10}
                                max={200}
                                step={10}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Crawl Depth: {websiteConfig.crawlDepth}</Label>
                              <Slider
                                value={[websiteConfig.crawlDepth]}
                                onValueChange={(value) => setWebsiteConfig({ ...websiteConfig, crawlDepth: value[0] })}
                                min={1}
                                max={5}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Cancel
                          </Button>
                          <Button className="flex-1 bg-primary hover:bg-primary/90">Connect Source</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Connected Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mockSources.map((source) => (
                <Card key={source.id} className="p-6 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{source.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{source.name}</h3>
                        <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configure {source.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            <p>Settings configuration for {source.name}</p>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Cancel
                            </Button>
                            <Button className="flex-1 bg-primary hover:bg-primary/90">Save Changes</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📄</span>
                      <span>{source.documents} documents indexed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🔄</span>
                      <span>Last synced: {source.lastSynced}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⚡</span>
                      <span>Next sync: {source.nextSync}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent h-9">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button variant="outline" className="bg-transparent h-9" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty Sources Card */}
            {mockSources.length < 4 && (
              <Card className="p-8 border border-border border-dashed text-center">
                <Chrome className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Add More Sources</h3>
                <p className="text-muted-foreground mb-6">
                  Connect additional knowledge sources to improve answer quality
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Another Source
                </Button>
              </Card>
            )}

            {/* Information Section */}
            <Card className="p-6 border border-border bg-muted/30 mt-8">
              <h3 className="font-semibold text-foreground mb-3">How Sources Work</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Connected sources are automatically indexed and made available for answer generation</li>
                <li>• Sync frequency determines how often your sources are updated</li>
                <li>• Higher quality and more comprehensive sources lead to better answer confidence</li>
                <li>• You can manage file types and crawl depth per source for optimal performance</li>
              </ul>
            </Card>
          </div>
        </main></>
  )
}
