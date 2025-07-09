"use client"

import type React from "react"

import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Edit, Trash2, User, Mail, Phone } from "lucide-react"

interface Staff {
  id: string
  name: string
  email: string
  phone: string
  role: "staff" | "manager"
  status: "active" | "inactive"
  joinDate: string
}

const mockStaff: Staff[] = [
  {
    id: "1",
    name: "Fatima Hassan",
    email: "fatima@business.com",
    phone: "+234 801 234 5678",
    role: "staff",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Ibrahim Musa",
    email: "ibrahim@business.com",
    phone: "+234 802 345 6789",
    role: "manager",
    status: "active",
    joinDate: "2023-11-20",
  },
  {
    id: "3",
    name: "Kemi Adebayo",
    email: "kemi@business.com",
    phone: "+234 803 456 7890",
    role: "staff",
    status: "inactive",
    joinDate: "2024-02-10",
  },
]

export default function StaffManagement() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<Staff[]>(mockStaff)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  // Redirect if not owner
  if (user?.role !== "owner") {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only business owners can access staff management.</p>
        </div>
      </AppLayout>
    )
  }

  const handleAddStaff = (newStaff: Omit<Staff, "id" | "joinDate">) => {
    const staff_member: Staff = {
      ...newStaff,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split("T")[0],
    }
    setStaff((prev) => [...prev, staff_member])
    setShowAddForm(false)
  }

  const handleEditStaff = (updatedStaff: Staff) => {
    setStaff((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)))
    setEditingStaff(null)
  }

  const handleDeleteStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)),
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your team members</p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    member.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">Joined: {new Date(member.joinDate).toLocaleDateString()}</div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingStaff(member)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-1 text-sm transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>

                <button
                  onClick={() => toggleStatus(member.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    member.status === "active"
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {member.status === "active" ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members</h3>
            <p className="text-gray-600">Add your first team member to get started.</p>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddForm && <StaffForm onSubmit={handleAddStaff} onCancel={() => setShowAddForm(false)} />}

        {/* Edit Staff Modal */}
        {editingStaff && (
          <StaffForm staff={editingStaff} onSubmit={handleEditStaff} onCancel={() => setEditingStaff(null)} />
        )}
      </div>
    </AppLayout>
  )
}

function StaffForm({
  staff,
  onSubmit,
  onCancel,
}: {
  staff?: Staff
  onSubmit: (staff: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    role: staff?.role || "staff",
    status: staff?.status || "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(staff ? { ...staff, ...formData } : formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{staff ? "Edit Staff Member" : "Add New Staff Member"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as "staff" | "manager" }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {staff ? "Update" : "Add"} Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
