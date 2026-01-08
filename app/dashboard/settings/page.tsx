"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [confidenceThreshold, setConfidenceThreshold] = useState(70)
  const [autoGenerate, setAutoGenerate] = useState(true)

  const [formData, setFormData] = useState({
    rfpTitle: "Enterprise Cloud Infrastructure RFP",
    clientName: "TechCorp Solutions",
    deadline: "2025-02-15",
    industry: "technology",
    defaultTone: "professional",
    defaultLength: "detailed",
  })

  return (
    <>
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-xs md:text-base text-muted-foreground">
                Manage your RFP preferences and configuration
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-full md:max-w-2xl grid-cols-2 md:grid-cols-4 mb-6 md:mb-8 bg-muted p-1 rounded-lg gap-1">
                <TabsTrigger value="general" className="rounded text-xs md:text-sm">
                  General
                </TabsTrigger>
                <TabsTrigger value="ai" className="rounded text-xs md:text-sm">
                  AI Preferences
                </TabsTrigger>
                <TabsTrigger value="export" className="rounded text-xs md:text-sm">
                  Export
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded text-xs md:text-sm">
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">RFP Information</h3>

                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs md:text-sm">
                        RFP Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.rfpTitle}
                        onChange={(e) => setFormData({ ...formData, rfpTitle: e.target.value })}
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="client" className="text-xs md:text-sm">
                        Client Name
                      </Label>
                      <Input
                        id="client"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-xs md:text-sm">
                        Submission Deadline
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-xs md:text-sm">
                        Industry
                      </Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      >
                        <SelectTrigger id="industry" className="bg-muted text-xs md:text-sm h-9 md:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2 md:pt-4">
                      <Button className="bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* AI Preferences Tab */}
              <TabsContent value="ai" className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">
                    AI Generation Settings
                  </h3>

                  <div className="space-y-4 md:space-y-6">
                    {/* Default Tone */}
                    <div className="space-y-3 md:space-y-4">
                      <Label className="text-sm md:text-base font-semibold">Default Tone</Label>
                      <div className="space-y-2 md:space-y-3">
                        {[
                          {
                            value: "professional",
                            label: "Professional",
                            description: "Formal, business-appropriate language",
                          },
                          {
                            value: "casual",
                            label: "Casual",
                            description: "Conversational, friendly approach",
                          },
                          {
                            value: "technical",
                            label: "Technical",
                            description: "Detailed, technical terminology",
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-start gap-3 p-2 md:p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="tone"
                              value={option.value}
                              checked={formData.defaultTone === option.value}
                              onChange={(e) => setFormData({ ...formData, defaultTone: e.target.value })}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-xs md:text-sm">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Default Length */}
                    <div className="space-y-3 md:space-y-4 pt-2 md:pt-4">
                      <Label className="text-sm md:text-base font-semibold">Default Length</Label>
                      <div className="space-y-2 md:space-y-3">
                        {[
                          { value: "concise", label: "Concise", description: "Brief, to-the-point responses" },
                          { value: "detailed", label: "Detailed", description: "Comprehensive with examples" },
                          {
                            value: "comprehensive",
                            label: "Comprehensive",
                            description: "In-depth with case studies",
                          },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex items-start gap-3 p-2 md:p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="length"
                              value={option.value}
                              checked={formData.defaultLength === option.value}
                              onChange={(e) => setFormData({ ...formData, defaultLength: e.target.value })}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-xs md:text-sm">{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Threshold */}
                    <div className="space-y-3 md:space-y-4 border-t border-border pt-4 md:pt-6">
                      <div>
                        <Label className="text-sm md:text-base font-semibold">Confidence Threshold</Label>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          Only show answers above this confidence level
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          <Slider
                            value={[confidenceThreshold]}
                            onValueChange={(value) => setConfidenceThreshold(value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-lg md:text-2xl font-bold text-primary w-12 md:w-16 text-right">
                            {confidenceThreshold}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>

                    {/* Auto-generate Toggle */}
                    <div className="flex items-center justify-between border-t border-border pt-4 md:pt-6">
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm md:text-base font-semibold">Auto-generate Answers</Label>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          Automatically generate answers for new questions
                        </p>
                      </div>
                      <Switch checked={autoGenerate} onCheckedChange={setAutoGenerate} className="ml-4" />
                    </div>

                    <div className="pt-2 md:pt-4">
                      <Button className="bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm">
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Export Tab */}
              <TabsContent value="export" className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">Export Settings</h3>

                  <div className="space-y-3 md:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="template" className="text-xs md:text-sm">
                        Export Template
                      </Label>
                      <Select defaultValue="standard">
                        <SelectTrigger id="template" className="bg-muted text-xs md:text-sm h-9 md:h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Format</SelectItem>
                          <SelectItem value="detailed">Detailed with Sources</SelectItem>
                          <SelectItem value="minimal">Minimal Format</SelectItem>
                          <SelectItem value="custom">Custom Template</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-xs md:text-sm">
                        Company Name
                      </Label>
                      <Input
                        id="company"
                        placeholder="Your Company Name"
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo" className="text-xs md:text-sm">
                        Logo URL (Optional)
                      </Label>
                      <Input
                        id="logo"
                        placeholder="https://example.com/logo.png"
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="header" className="text-xs md:text-sm">
                        Header Text
                      </Label>
                      <Input
                        id="header"
                        placeholder="Proposal Response"
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="footer" className="text-xs md:text-sm">
                        Footer Text
                      </Label>
                      <Input
                        id="footer"
                        placeholder="Confidential - For Internal Use Only"
                        className="bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>

                    <div className="pt-2 md:pt-4">
                      <Button className="bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm">
                        Save Export Settings
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-6">
                    Notification Preferences
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    {[
                      {
                        label: "Answer Generated",
                        description: "Notify when AI generates a new answer",
                        defaultChecked: true,
                      },
                      {
                        label: "Daily Summary",
                        description: "Get a daily summary of RFP progress",
                        defaultChecked: true,
                      },
                      {
                        label: "Deadline Reminders",
                        description: "Remind me when RFP deadlines are approaching",
                        defaultChecked: true,
                      },
                      {
                        label: "Source Sync Complete",
                        description: "Notify when knowledge sources are synced",
                        defaultChecked: false,
                      },
                      {
                        label: "Low Confidence Alerts",
                        description: "Alert when answers have low confidence scores",
                        defaultChecked: true,
                      },
                    ].map((notif, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 md:p-4 border border-border rounded-lg gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-xs md:text-sm">{notif.label}</p>
                          <p className="text-xs text-muted-foreground">{notif.description}</p>
                        </div>
                        <Switch defaultChecked={notif.defaultChecked} className="flex-shrink-0" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
                    <Button className="bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm">
                      Save Notification Settings
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </>
  )
}
