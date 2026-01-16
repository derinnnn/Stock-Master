"use client"

import { useState } from "react"
import { Save, Building, Loader2 } from "lucide-react"
import { updateBusinessSettings } from "@/app/actions/settings"

// FIX: Update Type Definition
type BusinessSettings = {
  business_name: string // <--- Changed from 'name'
  address: string
  phone: string
  currency: string
  tax_rate: number
}

export default function SettingsClient({ initialData }: { initialData: BusinessSettings | null }) {
  const [isSaving, setIsSaving] = useState(false)
  
  // FIX: Read 'business_name' from server data
  const [formData, setFormData] = useState({
    name: initialData?.business_name || "", // <--- CHANGED THIS LINE
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    currency: initialData?.currency || "NGN",
    taxRate: initialData?.tax_rate?.toString() || "7.5",
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const dataToSend = new FormData()
    dataToSend.append('name', formData.name)
    dataToSend.append('address', formData.address)
    dataToSend.append('phone', formData.phone)
    dataToSend.append('currency', formData.currency)
    dataToSend.append('taxRate', formData.taxRate)

    const result = await updateBusinessSettings(dataToSend)

    if (result.success) {
      alert("Settings saved successfully!")
    } else {
      alert("Error saving: " + result.error)
    }
    setIsSaving(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-64">
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors bg-blue-100 text-blue-600 font-medium">
            <Building className="h-5 w-5" />
            <span>Business Info</span>
          </button>
        </nav>
      </div>

      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-4 mb-6">Business Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Business Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Peakview Facility"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Business Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="NGN">Nigerian Naira (₦)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}