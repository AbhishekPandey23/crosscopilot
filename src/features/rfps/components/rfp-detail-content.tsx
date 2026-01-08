"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, Download, Settings, MoreVertical, Zap, Eye, RefreshCw, Edit, 
  CheckIcon, Loader2, AlertCircle, FileText, Copy, Check
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { orpc } from "@/lib/orpc"

// Status configuration map
const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200", label: "Pending" },
  AI_GENERATED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "AI Generated" },
  REVIEWED: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Reviewed" },
  APPROVED: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Approved" },
}

const rfpStatusConfig: Record<string, { color: string; label: string }> = {
  DRAFT: { color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200", label: "Draft" },
  IN_PROGRESS: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", label: "In Progress" },
  REVIEW: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Review" },
  SUBMITTED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Submitted" },
  WON: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", label: "Won" },
  LOST: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Lost" },
  NO_BID: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "No Bid" },
}

export default function RFPDetailContent() {
  const router = useRouter()
  const params = useParams()
  const rfpId = params.rfpsId as string

  // Query Hooks
  const { data: rfpData, isLoading, error, refetch } = useQuery(orpc.rfps.detail.queryOptions({ input: { id: rfpId } }) as any) as any

  // Mutation Hooks
  const generateAnswer = useMutation({
    ...orpc.rfps.questions.generateAnswer.mutationOptions(),
    onSuccess: () => {
      toast.success("Answer generated successfully!")
      refetch()
    },
    onError: (err: Error) => toast.error(err.message)
  } as any) as any

  const generateAll = useMutation({
    ...orpc.rfps.questions.generateAll.mutationOptions(),
    onSuccess: (data: { message: string }) => {
      toast.success(data.message)
      // Poll a few times to update UI
      setTimeout(() => refetch(), 2000)
    },
    onError: (err: Error) => toast.error(err.message)
  } as any) as any

  const regenerateAnswer = useMutation({
    ...orpc.rfps.questions.regenerate.mutationOptions(),
    onSuccess: () => {
      toast.success("Answer regenerated successfully!")
      setIsRegenerateDialogOpen(false)
      setRegenerateFeedback("")
      refetch()
    },
    onError: (err: Error) => toast.error(err.message)
  } as any) as any

  const updateQuestion = useMutation({
    ...orpc.rfps.questions.update.mutationOptions(),
    onSuccess: () => {
      toast.success("Answer saved successfully!")
      setIsEditDialogOpen(false)
      refetch()
    },
    onError: (err: Error) => toast.error(err.message)
  } as any) as any

  const approveAnswer = useMutation({
    ...orpc.rfps.questions.approve.mutationOptions(),
    onSuccess: () => {
      toast.success("Answer approved!")
      refetch()
    },
    onError: (err: Error) => toast.error(err.message)
  } as any) as any

  // Local State
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("number")
  
  // Dialog State
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  
  const [isDataEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedAnswer, setEditedAnswer] = useState("")
  
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false)
  const [regenerateFeedback, setRegenerateFeedback] = useState("")
  
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Derived State
  const selectedQuestion = rfpData?.questions.find((q: any) => q.id === selectedQuestionId)

  // Handlers
  const handleGenerateAnswer = (questionId: string, toneStyle?: string, maxLength?: string) => {
    generateAnswer.mutate({ 
      questionId, 
      toneStyle: toneStyle || "professional", 
      maxLength: (maxLength as "short"|"medium"|"long") || "medium" 
    })
  }

  const handleGenerateAll = () => {
    if (!rfpData) return
    generateAll.mutate({ 
      rfpId, 
      organizationId: rfpData.organizationId 
    })
  }

  const handleSaveEditedAnswer = () => {
    if (!selectedQuestionId) return
    updateQuestion.mutate({
      questionId: selectedQuestionId,
      finalAnswer: editedAnswer,
      status: "REVIEWED"
    })
  }

  const handleRegenerateSubmit = () => {
    if (!selectedQuestionId) return
    regenerateAnswer.mutate({
      questionId: selectedQuestionId,
      feedback: regenerateFeedback
    })
  }

  const handleApprove = (questionId: string) => {
    approveAnswer.mutate({ questionId })
  }

  const handleCopyAnswer = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const openEditDialog = (question: any) => {
    setSelectedQuestionId(question.id)
    setEditedAnswer(question.finalAnswer || question.aiAnswer || "")
    setIsEditDialogOpen(true)
  }

  const openRegenerateDialog = (question: any) => {
    setSelectedQuestionId(question.id)
    setRegenerateFeedback("")
    setIsRegenerateDialogOpen(true)
  }

  // Filter and sort questions
  const filteredQuestions = rfpData?.questions.filter((q: any) => {
    const matchesSearch = q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesStatus = filterStatus === "all" || q.status === filterStatus
    return matchesSearch && matchesStatus
  }) || []

  const sortedQuestions = [...filteredQuestions].sort((a: any, b: any) => {
    if (sortBy === "number") {
      const aNum = parseInt(a.questionNumber?.replace(/\D/g, "") || "0")
      const bNum = parseInt(b.questionNumber?.replace(/\D/g, "") || "0")
      return aNum - bNum
    }
    if (sortBy === "status") return a.status.localeCompare(b.status)
    if (sortBy === "confidence") return (b.confidence || 0) - (a.confidence || 0)
    return 0
  })

  // Loading state
  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading RFP data...</p>
          </div>
        </div>
      </main>
    )
  }

  // Error state
  if (error || !rfpData) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load RFP</h2>
            <p className="text-muted-foreground mb-4">{error?.message || "RFP not found"}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </main>
    )
  }

  const pendingCount = rfpData.questions.filter((q: any) => q.status === "PENDING").length
  const avgConfidence = rfpData.questions
    .filter((q: any) => q.confidence !== null)
    .reduce((sum: number, q: any) => sum + (q.confidence || 0), 0) / 
    (rfpData.questions.filter((q: any) => q.confidence !== null).length || 1)

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 md:mb-6 text-xs md:text-sm text-muted-foreground overflow-x-auto">
            <Link href="/dashboard" className="hover:text-foreground transition-colors whitespace-nowrap">
              Dashboard
            </Link>
            <span className="hidden sm:inline">/</span>
            <Link href="/dashboard/rfps" className="hover:text-foreground transition-colors whitespace-nowrap">
              RFPs
            </Link>
            <span className="hidden sm:inline">/</span>
            <span className="text-foreground whitespace-nowrap text-ellipsis overflow-hidden">
              {rfpData.title}
            </span>
          </div>

          {/* Header */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-4">
              <div className="flex-1 w-full">
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-2 line-clamp-2">
                  {rfpData.title}
                </h1>
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-semibold text-foreground">{rfpData.clientName}</span>
                  </div>
                  <Badge className={rfpStatusConfig[rfpData.status]?.color || "bg-slate-100 text-slate-800"}>
                    {rfpStatusConfig[rfpData.status]?.label || rfpData.status}
                  </Badge>
                  {rfpData.dueDate && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                      <span suppressHydrationWarning>
                        Due {new Date(rfpData.dueDate).toLocaleDateString('en-US')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none h-9 md:h-10 text-xs md:text-sm bg-transparent"
                >
                  <Download className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Export</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            {[
              { label: "Total Questions", value: rfpData.stats.totalQuestions, icon: "📋" },
              { label: "Answered", value: rfpData.stats.answeredQuestions, color: "text-primary" },
              { label: "Pending", value: pendingCount, color: "text-amber-600" },
              { label: "Avg. Confidence", value: `${Math.round(avgConfidence || 0)}%` },
            ].map((stat, idx) => (
              <Card key={idx} className="p-3 md:p-4 border border-border">
                <p className="text-xs text-muted-foreground mb-1 md:mb-2">{stat.label}</p>
                <p className={`text-lg md:text-2xl font-bold ${stat.color || "text-foreground"}`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Filter Bar */}
              <Card className="p-3 md:p-4 border border-border">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex gap-2 md:gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-muted text-xs md:text-sm h-9 md:h-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40 bg-muted text-xs md:text-sm h-9 md:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="AI_GENERATED">AI Generated</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40 bg-muted text-xs md:text-sm h-9 md:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">Question Number</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="confidence">Confidence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Questions List */}
              <div className="space-y-3 md:space-y-4">
                {sortedQuestions.length === 0 ? (
                  <Card className="p-8 border border-border">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No questions found</h3>
                      <p className="text-muted-foreground text-sm">
                        {rfpData.questions.length === 0 
                          ? "Questions are being extracted from your document..."
                          : "No questions match your search criteria."}
                      </p>
                    </div>
                  </Card>
                ) : (
                  sortedQuestions.map((question: any) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      isGenerating={generateAnswer.isPending && generateAnswer.variables?.questionId === question.id}
                      onGenerateAnswer={(tone, length) => handleGenerateAnswer(question.id, tone, length)}
                      onViewEdit={() => openEditDialog(question)}
                      onRegenerate={() => openRegenerateDialog(question)}
                      onApprove={() => handleApprove(question.id)}
                      onCopy={() => handleCopyAnswer(question.finalAnswer || question.aiAnswer || "", question.id)}
                      isCopied={copiedId === question.id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions */}
              <Card className="p-4 md:p-6 border border-border">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start h-8 md:h-9 bg-primary hover:bg-primary/90 text-xs"
                    size="sm"
                    onClick={handleGenerateAll}
                    disabled={generateAll.isPending || pendingCount === 0}
                  >
                    {generateAll.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2" />
                    )}
                    Generate All Pending ({pendingCount})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-8 md:h-9 bg-transparent text-xs"
                    size="sm"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </Card>

              {/* RFP Info */}
              <Card className="p-4 md:p-6 border border-border">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">RFP Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Client</p>
                    <p className="font-medium text-foreground">{rfpData.clientName}</p>
                  </div>
                  {rfpData.clientIndustry && (
                    <div>
                      <p className="text-muted-foreground">Industry</p>
                      <p className="font-medium text-foreground capitalize">{rfpData.clientIndustry}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium text-foreground">{rfpData.priority}</p>
                  </div>
                  {rfpData.dueDate && (
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium text-foreground" suppressHydrationWarning>
                        {new Date(rfpData.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Answer Dialog */}
      <Dialog open={isDataEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Answer</DialogTitle>
            <DialogDescription>
              {selectedQuestion?.questionText}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Sources */}
            {selectedQuestion?.answerSources && Array.isArray(selectedQuestion.answerSources) && selectedQuestion.answerSources.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Sources ({selectedQuestion.answerSources.length})</h4>
                <div className="space-y-2">
                  {(selectedQuestion.answerSources as any[]).map((source, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      <span className="font-medium">{source.documentTitle}</span>
                      <span className="ml-2 text-primary">
                        {Math.round(source.similarity * 100)}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              placeholder="Enter your answer..."
              className="min-h-[300px] resize-y"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedAnswer} disabled={updateQuestion.isPending}>
              {updateQuestion.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Dialog */}
      <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Answer</DialogTitle>
            <DialogDescription>
              Provide feedback to improve the answer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={regenerateFeedback}
              onChange={(e) => setRegenerateFeedback(e.target.value)}
              placeholder="E.g., Make it more technical, add more specific examples, shorten the response..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerateSubmit} disabled={regenerateAnswer.isPending || !regenerateFeedback.trim()}>
              {regenerateAnswer.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Regenerate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Question Card Component
interface QuestionCardProps {
  question: any
  isGenerating: boolean
  onGenerateAnswer: (toneStyle?: string, maxLength?: string) => void
  onViewEdit: () => void
  onRegenerate: () => void
  onApprove: () => void
  onCopy: () => void
  isCopied: boolean
}

function QuestionCard({
  question,
  isGenerating,
  onGenerateAnswer,
  onViewEdit,
  onRegenerate,
  onApprove,
  onCopy,
  isCopied,
}: QuestionCardProps) {
  const [toneStyle, setToneStyle] = useState(question.toneStyle || "professional")
  const [maxLength, setMaxLength] = useState(question.targetLength || "medium")

  const answer = question.finalAnswer || question.aiAnswer
  const statusCfg = statusConfig[question.status]

  return (
    <Card className="p-4 md:p-6 border border-border hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
              {question.questionNumber || "Q"}
            </Badge>
            <Badge className={statusCfg?.color || ""}>
              {statusCfg?.label || question.status}
            </Badge>
            {question.sectionName && (
              <Badge variant="outline" className="text-xs">
                {question.sectionName}
              </Badge>
            )}
          </div>
          <p className="text-sm md:text-base text-foreground font-medium">{question.questionText}</p>
        </div>

        {question.status !== "PENDING" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Answer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </DropdownMenuItem>
              {question.status !== "APPROVED" && (
                <DropdownMenuItem onClick={onApprove}>
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Pending: Show customization options */}
      {question.status === "PENDING" && (
        <>
          <div className="bg-muted/50 rounded-lg p-3 md:p-4 mb-4">
            <div className="space-y-3">
              <p className="text-xs md:text-sm font-medium text-foreground">
                Customize Answer Generation
              </p>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                <Select value={toneStyle} onValueChange={setToneStyle}>
                  <SelectTrigger className="w-full sm:w-36 bg-background text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={maxLength} onValueChange={setMaxLength}>
                  <SelectTrigger className="w-full sm:w-32 bg-background text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 h-8 md:h-9 text-xs md:text-sm"
            onClick={() => onGenerateAnswer(toneStyle, maxLength)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate Answer"}
          </Button>
        </>
      )}

      {/* Generated/Reviewed/Approved: Show answer preview */}
      {question.status !== "PENDING" && answer && (
        <>
          {/* Confidence Score */}
          {question.confidence !== null && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-foreground">Confidence</span>
                <span className="text-xs md:text-sm font-semibold text-foreground">
                  {Math.round(question.confidence * 100)}%
                </span>
              </div>
              <Progress value={question.confidence * 100} className="h-2" />
            </div>
          )}

          {/* Answer Preview */}
          <div className="bg-muted/50 rounded-lg p-3 md:p-4 mb-4">
            <p className="text-xs md:text-sm text-foreground line-clamp-4 whitespace-pre-wrap">
              {answer}
            </p>
          </div>

          {/* Sources info */}
          {question.answerSources && Array.isArray(question.answerSources) && question.answerSources.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
              <span>{question.answerSources.length} sources used</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-8 md:h-9 bg-transparent text-xs"
              size="sm"
              onClick={onViewEdit}
            >
              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              View/Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-8 md:h-9 bg-transparent text-xs"
              size="sm"
              onClick={onRegenerate}
            >
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-8 md:h-9 bg-transparent text-xs"
              size="sm"
              onClick={onCopy}
            >
              {isCopied ? (
                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              ) : (
                <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              )}
              {isCopied ? "Copied!" : "Copy"}
            </Button>
            {question.status !== "APPROVED" && (
              <Button
                className="flex-1 h-8 md:h-9 bg-green-600 hover:bg-green-700 text-xs"
                size="sm"
                onClick={onApprove}
              >
                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                Approve
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
