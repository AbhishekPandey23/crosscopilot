import { create } from "zustand"
import { persist } from "zustand/middleware"

interface VendorState {
  vendorType: string
  setVendorType: (type: string) => void
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set) => ({
      vendorType: 'individual', // Default value
      setVendorType: (type) => set({ vendorType: type }),
    }),
    {
      name: "vendor-storage",
    },
  ),
)
