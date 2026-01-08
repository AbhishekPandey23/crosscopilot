"use client"

import { Suspense } from "react"
import RFPDetailContent from "@/features/rfps/components/rfp-detail-content"
import Loading from "./loading"

export default function RFPDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RFPDetailContent />
    </Suspense>
  )
}
