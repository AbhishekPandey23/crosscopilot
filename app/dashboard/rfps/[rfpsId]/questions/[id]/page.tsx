"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Save, X, RotateCw, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const mockQuestion = {
  id: "2",
  number: "Q2",
  section: "Section A",
  text: "How do you ensure quality control in your manufacturing process?",
  pageNumber: 5,
  status: "generated",
  confidence: 87,
}

const mockAnswer = `Our quality control process involves multiple layers of inspection and testing to ensure every product meets the highest standards.

Initial Quality Assurance:
- Raw material inspection and certification
- Pre-production equipment calibration
- Incoming inspection protocols

In-Process Quality Control:
- Real-time monitoring during manufacturing
- Statistical process control (SPC)
- Automated defect detection systems
- Regular sampling and testing

Final Quality Inspection:
- 100% visual inspection of critical components
- Functional testing of finished products
- Performance validation under various conditions
- Documentation and traceability

Continuous Improvement:
- Regular quality audits and reviews
- Customer feedback integration
- Process optimization initiatives
- Staff training and certification programs

We maintain ISO 9001:2015 certification and comply with industry-specific quality standards including AS9100 for aerospace and IPC standards for electronics.`

const mockSources = [
  {
    id: "1",
    name: "Company Quality Policy Document",
    relevance: 95,
    excerpt:
      "Our multi-layered approach to quality includes automated inspection systems and statistical process control methodologies.",
  },
  {
    id: "2",
    name: "Manufacturing Process Documentation",
    relevance: 89,
    excerpt:
      "All production lines are equipped with real-time monitoring systems that track key quality metrics continuously.",
  },
  {
    id: "3",
    name: "ISO 9001 Certification Files",
    relevance: 82,
    excerpt: "We maintain rigorous quality management standards as evidenced by our ISO 9001:2015 certification.",
  },
]

export default function QuestionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rfpsId = params.rfpsId as string
  const id = params.id as string
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState("detailed")
  const [answer, setAnswer] = useState(mockAnswer)
  const [isEditing, setIsEditing] = useState(false)
  const [showEditHistory, setShowEditHistory] = useState(false)

  return (
    <>
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Back Button & Breadcrumb */}
            <div className="flex items-center gap-2 mb-4 md:mb-6 text-xs md:text-sm overflow-x-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0"
                onClick={() => router.back()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-muted-foreground whitespace-nowrap">
                <Link href="/" className="hover:text-foreground">
                  Dashboard
                </Link>
                <span className="mx-1">/</span>
                <Link href={`/dashboard/rfps/${rfpsId}`} className="hover:text-foreground">
                  RFP
                </Link>
                <span className="mx-1">/</span>
                <span className="text-foreground">Question {id}</span>
              </div>
            </div>

            {/* Question Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 md:mb-4 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm md:text-lg px-2 md:px-3 py-1">
                      {mockQuestion.number}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                      AI Generated
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {mockQuestion.section}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Page {mockQuestion.pageNumber}</span>
                  </div>
                  <h1 className="text-xl md:text-3xl font-bold text-foreground">{mockQuestion.text}</h1>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Answer Editor */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Customization Panel */}
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Customization</h3>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs md:text-sm font-medium text-foreground">Tone</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "professional", label: "Professional" },
                          { value: "casual", label: "Casual" },
                          { value: "technical", label: "Technical" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTone(option.value)}
                            className={`px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                              tone === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs md:text-sm font-medium text-foreground">Length</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "concise", label: "Concise" },
                          { value: "detailed", label: "Detailed" },
                          { value: "comprehensive", label: "Comprehensive" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setLength(option.value)}
                            className={`px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                              length === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground hover:bg-muted/80"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 h-9 md:h-10 text-xs md:text-sm mt-4">
                      <RotateCw className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Regenerate with Settings
                    </Button>
                  </div>
                </Card>

                {/* Confidence Score */}
                <Card className="p-4 md:p-6 border border-border">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-foreground">Confidence Score</span>
                      <span className="text-xl md:text-2xl font-bold text-foreground">{mockQuestion.confidence}%</span>
                    </div>
                    <Progress value={mockQuestion.confidence} className="h-2 md:h-3" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This answer has high confidence based on source relevance
                  </p>
                </Card>

                {/* Answer Editor */}
                <Card className="p-4 md:p-6 border border-border">
                  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-semibold text-foreground">Answer</h3>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            className="bg-primary hover:bg-primary/90 h-8 text-xs"
                          >
                            <Save className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAnswer(mockAnswer)
                              setIsEditing(false)
                            }}
                            className="bg-transparent h-8"
                          >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="bg-transparent h-8 text-xs"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="min-h-64 md:min-h-96 bg-muted text-xs md:text-sm"
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{answer}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground border-t border-border pt-4 gap-2">
                    <span>{answer.length} characters</span>
                    <span>Last edited: 2 hours ago</span>
                  </div>
                </Card>

                {/* Edit History */}
                <Collapsible open={showEditHistory} onOpenChange={setShowEditHistory}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs md:text-sm font-medium text-foreground hover:text-primary">
                    <ChevronLeft className={`w-4 h-4 transition-transform ${showEditHistory ? "rotate-90" : ""}`} />
                    Edit History
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-3">
                    {[
                      {
                        version: 1,
                        timestamp: "2 hours ago",
                        preview: "Our quality control process includes multiple...",
                      },
                      {
                        version: 2,
                        timestamp: "1 hour ago",
                        preview: "Enhanced version with additional ISO certification...",
                      },
                    ].map((version) => (
                      <Card key={version.version} className="p-3 md:p-4 border border-border">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <span className="text-xs md:text-sm font-medium text-foreground">
                            Version {version.version}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{version.timestamp}</span>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3">{version.preview}</p>
                        <Button variant="outline" size="sm" className="w-full bg-transparent h-7 md:h-8 text-xs">
                          Restore Version
                        </Button>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent h-9 md:h-10 text-xs" size="sm">
                    Mark as Reviewed
                  </Button>
                  <Button className="flex-1 bg-green-700 hover:bg-green-900 h-9 md:h-10 text-xs" size="sm">
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Approve Answer
                  </Button>
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Sources Used</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-4">{mockSources.length} sources</p>

                  <div className="space-y-3 md:space-y-4">
                    {mockSources.map((source) => (
                      <Card key={source.id} className="p-3 md:p-4 border border-border bg-muted/50">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h4 className="font-medium text-foreground text-xs md:text-sm">{source.name}</h4>
                          <Badge className="bg-primary/20 text-primary text-xs flex-shrink-0">
                            {source.relevance}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{source.excerpt}</p>
                        <Button variant="outline" size="sm" className="w-full bg-transparent h-7 md:h-8 text-xs">
                          View Full Document
                        </Button>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Suggestions */}
                <Card className="p-4 md:p-6 border border-border">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Similar Questions</h3>
                  <div className="space-y-2">
                    {["Q1: Quality Assurance Processes", "Q7: Manufacturing Standards Compliance"].map((q, idx) => (
                      <Link
                        key={idx}
                        href="#"
                        className="block p-2 md:p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-xs md:text-sm text-foreground"
                      >
                        {q}
                      </Link>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
      </main>
    </>
  )
}
