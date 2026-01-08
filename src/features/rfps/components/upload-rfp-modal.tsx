"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Cloud, CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UploadRFPModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId?: string
}

type UploadStep = "file" | "details" | "processing" | "success" | "error"

interface ProcessingStep {
  label: string
  status: "pending" | "loading" | "completed" | "error"
}

export function UploadRFPModal({ open, onOpenChange, organizationId }: UploadRFPModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<UploadStep>("file")
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [rfpTitle, setRfpTitle] = useState("")
  const [clientName, setClientName] = useState("")
  const [deadline, setDeadline] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [createdRfpId, setCreatedRfpId] = useState<string | null>(null)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { label: "Uploading document", status: "pending" },
    { label: "Creating RFP record", status: "pending" },
    { label: "Starting document processing", status: "pending" },
    { label: "Extraction queued", status: "pending" },
  ])

  const updateProcessingStep = (index: number, status: ProcessingStep["status"]) => {
    setProcessingSteps(prev => prev.map((s, i) => 
      i === index ? { ...s, status } : s
    ))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.")
        return
      }

      // Validate file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 50MB.")
        return
      }

      setFile(selectedFile)
      setFileName(selectedFile.name)
      setRfpTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      setUploadError(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const inputEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(inputEvent)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleProcessRFP = async () => {
    if (!file) return
    
    setStep("processing")
    setIsUploading(true)
    setUploadError(null)

    try {
      // Step 1: Upload the file
      updateProcessingStep(0, "loading")
      const formData = new FormData()
      formData.append("file", file)
      if (organizationId) {
        formData.append("organizationId", organizationId)
      }

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || "Failed to upload file")
      }

      const uploadResult = await uploadResponse.json()
      updateProcessingStep(0, "completed")

      // Step 2: Create RFP record
      updateProcessingStep(1, "loading")
      
      const createResponse = await fetch("/api/rpc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          procedure: "rfps.create",
          input: {
            title: rfpTitle,
            description: description || undefined,
            clientName: clientName || "Unknown Client",
            clientIndustry: industry || undefined,
            priority,
            dueDate: deadline || undefined,
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            organizationId: organizationId || "default-org", // TODO: Get from user context
          },
        }),
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || "Failed to create RFP")
      }

      const createResult = await createResponse.json()
      updateProcessingStep(1, "completed")

      // Step 3: Processing started (handled by Inngest in background)
      updateProcessingStep(2, "loading")
      await new Promise(resolve => setTimeout(resolve, 500))
      updateProcessingStep(2, "completed")

      // Step 4: Extraction queued
      updateProcessingStep(3, "loading")
      await new Promise(resolve => setTimeout(resolve, 500))
      updateProcessingStep(3, "completed")

      setCreatedRfpId(createResult.rfp?.id || null)
      setStep("success")
      
      toast.success("RFP uploaded successfully! Document processing started.")

    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "An error occurred")
      setStep("error")
      
      // Mark current loading step as error
      setProcessingSteps(prev => prev.map(s => 
        s.status === "loading" ? { ...s, status: "error" } : s
      ))
      
      toast.error(error instanceof Error ? error.message : "Failed to upload RFP")
    } finally {
      setIsUploading(false)
    }
  }

  const resetModal = () => {
    setStep("file")
    setFile(null)
    setFileName("")
    setRfpTitle("")
    setClientName("")
    setDeadline("")
    setIndustry("")
    setDescription("")
    setPriority("MEDIUM")
    setUploadError(null)
    setCreatedRfpId(null)
    setProcessingSteps([
      { label: "Uploading document", status: "pending" },
      { label: "Creating RFP record", status: "pending" },
      { label: "Starting document processing", status: "pending" },
      { label: "Extraction queued", status: "pending" },
    ])
  }

  const handleClose = () => {
    resetModal()
    onOpenChange(false)
  }

  const handleViewRFP = () => {
    if (createdRfpId) {
      router.push(`/dashboard/rfps/${createdRfpId}`)
    }
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {step === "file" && (
          <>
            <DialogHeader>
              <DialogTitle>Upload New RFP</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* File Upload Zone */}
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  <Cloud className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-lg font-semibold text-foreground mb-1">Drag and drop your RFP document here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </label>
              </div>

              {fileName && (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Ready to upload"}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setFileName("")
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Supported formats: .pdf, .docx, .doc, .txt</p>
                <p>Max file size: 50MB</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("details")}
                  disabled={!fileName}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <DialogHeader>
              <DialogTitle>RFP Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">RFP Title *</Label>
                <Input
                  id="title"
                  value={rfpTitle}
                  onChange={(e) => setRfpTitle(e.target.value)}
                  placeholder="Enter RFP title"
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Submission Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority" className="bg-muted">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry" className="bg-muted">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional notes about this RFP"
                  className="bg-muted resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("file")} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleProcessRFP}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!rfpTitle || isUploading}
                >
                  {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Process RFP
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Processing Your RFP</h3>
              <p className="text-muted-foreground">This may take a few moments...</p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              {processingSteps.map((processStep, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {processStep.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : processStep.status === "loading" ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                  ) : processStep.status === "error" ? (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <span className={
                    processStep.status === "completed" ? "text-foreground font-medium" :
                    processStep.status === "loading" ? "text-foreground font-medium" :
                    processStep.status === "error" ? "text-destructive font-medium" :
                    "text-muted-foreground"
                  }>
                    {processStep.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">RFP Uploaded Successfully!</h3>
              <p className="text-muted-foreground">
                Your document is being processed in the background. Questions will be extracted and available shortly.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Upload Another
              </Button>
              <Button
                onClick={handleViewRFP}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                View RFP
              </Button>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Upload Failed</h3>
              <p className="text-muted-foreground mb-4">
                {uploadError || "An error occurred while processing your RFP."}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setStep("details")
                  setUploadError(null)
                  setProcessingSteps([
                    { label: "Uploading document", status: "pending" },
                    { label: "Creating RFP record", status: "pending" },
                    { label: "Starting document processing", status: "pending" },
                    { label: "Extraction queued", status: "pending" },
                  ])
                }}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
