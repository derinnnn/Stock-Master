"use client"

import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { Save, Building, User, Bell, Shield, Palette } from "lucide-react"

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("business")
  const [businessSettings, setBusinessSettings] = useState({
    name: user?.businessName || "",
    address: "123 Market Street, Lagos, Nigeria",
    phone: "+234 801 234 5678",
    email: user?.email || "",
    currency: "NGN",
    taxRate: "7.5",
  })

  const [notifications, setNotifications] = useState({
    lowStock: true,
    dailyReports: false,
    salesAlerts: true,
    emailNotifications: true,
  })

  // Redirect if not owner
  if (user?.role !== "owner") {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only business owners can access settings.</p>
        </div>
      </AppLayout>
    )
  }

  const tabs = [
    { id: "business", name: "Business Info", icon: Building },
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Palette },
  ]

  const handleSave = () => {
    alert("Settings saved successfully!")
  }

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
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Business Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                      <input
                        type="text"
                        value={businessSettings.name}
                        onChange={(e) => setBusinessSettings((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={businessSettings.phone}
                        onChange={(e) => setBusinessSettings((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                      <textarea
                        value={businessSettings.address}
                        onChange={(e) => setBusinessSettings((prev) => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={businessSettings.currency}
                        onChange={(e) => setBusinessSettings((prev) => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="NGN">Nigerian Naira (₦)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={businessSettings.taxRate}
                        onChange={(e) => setBusinessSettings((prev) => ({ ...prev, taxRate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Profile Settings</h2>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user?.name}</h3>
                      <p className="text-sm text-gray-500">Business Owner</p>
                      <button className="text-sm text-blue-600 hover:text-blue-500 mt-1">Change Photo</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Notification Preferences</h2>

                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {key === "lowStock" && "Low Stock Alerts"}
                            {key === "dailyReports" && "Daily Reports"}
                            {key === "salesAlerts" && "Sales Notifications"}
                            {key === "emailNotifications" && "Email Notifications"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {key === "lowStock" && "Get notified when items are running low"}
                            {key === "dailyReports" && "Receive daily business summary"}
                            {key === "salesAlerts" && "Get notified of new sales"}
                            {key === "emailNotifications" && "Receive notifications via email"}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Security Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-3">Add an extra layer of security to your account</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Appearance Settings</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Theme</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <button className="p-4 border-2 border-blue-500 rounded-lg bg-white">
                          <div className="w-full h-8 bg-gray-100 rounded mb-2"></div>
                          <p className="text-sm">Light</p>
                        </button>
                        <button className="p-4 border-2 border-gray-300 rounded-lg bg-gray-900">
                          <div className="w-full h-8 bg-gray-700 rounded mb-2"></div>
                          <p className="text-sm text-white">Dark</p>
                        </button>
                        <button className="p-4 border-2 border-gray-300 rounded-lg bg-gradient-to-br from-white to-gray-900">
                          <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-700 rounded mb-2"></div>
                          <p className="text-sm">Auto</p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Language</h3>
                      <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="en">English</option>
                        <option value="ha">Hausa</option>
                        <option value="yo">Yoruba</option>
                        <option value="ig">Igbo</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
