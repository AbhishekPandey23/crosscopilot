"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UploadRFPModal } from "@/features/rfps/components/upload-rfp-modal"
import { Upload, FileText, Clock, Zap } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { orpc } from "@/lib/orpc"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"



const statusConfig: Record<string, { color: string; label: string }> = {
  DRAFT: { color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200", label: "Draft" },
  IN_PROGRESS: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", label: "In Progress" },
  REVIEW: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Review" },
  SUBMITTED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Submitted" },
  WON: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200", label: "Won" },
  LOST: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Lost" },
  NO_BID: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "No Bid" },
  // Compatibility with old mock statuses if any remain
  processing: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Processing" },
  ready: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Ready" },
}

export default function Dashboard() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const { data: rfpData, isLoading } = useQuery(orpc.rfps.list.queryOptions({ 
    input: { limit: 50, offset: 0, organizationId: "" } // organizationId is handled by middleware but required by zod
  }))

  const rfps = rfpData?.rfps || []
  const filteredRFPs = filterStatus === "ALL" ? rfps : rfps.filter((rfp) => rfp.status === filterStatus)

  const hasRFPs = rfps.length > 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <>
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Your RFPs</h1>
              <p className="text-muted-foreground">
                Manage and generate AI-powered responses to your proposals
              </p>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                onClick={() => setUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New RFP
              </Button>
              <Button variant="outline" className="bg-transparent">
                Connect Sources
              </Button>
            </div>

            {/* Filter Tabs */}
            {hasRFPs && (
              <div className="flex gap-2 mb-6 border-b border-border pb-4">
                {[
                  { label: "All", value: "ALL" },
                  { label: "Draft", value: "DRAFT" },
                  { label: "In Progress", value: "IN_PROGRESS" },
                  { label: "Review", value: "REVIEW" },
                  { label: "Submitted", value: "SUBMITTED" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      filterStatus === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {hasRFPs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRFPs.map((rfp) => {
                  const config = statusConfig[rfp.status as keyof typeof statusConfig]
                  return (
                    <Card
                      key={rfp.id}
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer border border-border"
                      onClick={() => router.push(`/dashboard/rfps/${rfp.id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>

                      <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                        {rfp.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">{rfp.clientName}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span suppressHydrationWarning>
                            Due {rfp.dueDate ? new Date(rfp.dueDate).toLocaleDateString() : "No deadline"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{(rfp as any)._count.questions} questions</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="font-semibold text-foreground">
                              {Math.round(
                                ((rfp as any).questions?.length || 0) /
                                  ((rfp as any)._count.questions || 1) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              ((rfp as any).questions?.length || 0) /
                              ((rfp as any)._count.questions || 1) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground pt-1">
                          Created {new Date(rfp.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 h-9"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/rfps/${rfp.id}`)
                          }}
                        >
                          Open
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Zap className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No RFPs yet</h3>
                <p className="text-muted-foreground mb-6 text-center max-w-md">
                  Upload your first RFP document to start generating AI-powered responses
                </p>
                <Button
                  onClick={() => setUploadModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload RFP
                </Button>
              </div>
            )}
          </div>
        </main>

    <UploadRFPModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </>
  )
}
