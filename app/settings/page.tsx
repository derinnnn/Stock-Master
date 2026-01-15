"use client"

import { useState, useEffect } from "react"
import AppLayout from "../components/AppLayout"
import { createClient } from "./../utils/supabase/client" // Use Client Supabase
import { updateBusinessSettings } from "@/app/actions/settings" // Import the action
import { Save, Building, User, Bell, Shield, Palette, Loader2 } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Real State for Form
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    currency: "NGN",
    taxRate: "7.5",
  })

  // 1. Fetch REAL Data on Load
  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: business } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', user.id)
          .single()

        if (business) {
          setFormData({
            name: business.name || "",
            address: business.address || "",
            phone: business.phone || "",
            email: user.email || "",
            currency: business.currency || "NGN",
            taxRate: business.tax_rate?.toString() || "7.5",
          })
        }
      }
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  // 2. Handle the Real Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault() // Stop page reload
    setIsSaving(true)

    // Create FormData to send to server
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

  const tabs = [
    { id: "business", name: "Business Info", icon: Building },
    // Hidden others for V1 as they are complex to wire up immediately
    // { id: "profile", name: "Profile", icon: User },
  ]

  if (isLoading) return <AppLayout><div className="p-12 text-center">Loading settings...</div></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your business preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {activeTab === "business" && (
                <form onSubmit={handleSave} className="space-y-6">
                  <h2 className="text-lg font-semibold">Business Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}