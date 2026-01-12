"use client"

import { useState } from "react"
import { Plus, Mail, Phone, User, Trash2, Power, X } from "lucide-react"
import { addStaff, toggleStaffStatus, deleteStaff } from "@/app/actions/staff"

type StaffMember = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  joined_at: string
}

export default function StaffClient({ initialStaff }: { initialStaff: StaffMember[] }) {
  const [staff, setStaff] = useState(initialStaff)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Optimistic UI updates (Make it feel fast)
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    // Update UI immediately
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
    await toggleStaffStatus(id, currentStatus)
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to remove this staff member?")) return;
    setStaff(prev => prev.filter(s => s.id !== id))
    await deleteStaff(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* --- ADD STAFF MODAL --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Team Member</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
                setIsSubmitting(true)
                const result = await addStaff(formData)
                setIsSubmitting(false)
                if (result.success) {
                    setShowAddForm(false)
                    window.location.reload() // Refresh to fetch new list
                } else {
                    alert("Failed to add staff")
                }
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input name="name" required className="w-full border rounded p-2" placeholder="e.g. Ibrahim Musa" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input name="email" type="email" required className="w-full border rounded p-2" placeholder="staff@business.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input name="phone" className="w-full border rounded p-2" placeholder="080..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select name="role" className="w-full border rounded p-2">
                    <option value="staff">Staff (Standard Access)</option>
                    <option value="manager">Manager (Full Access)</option>
                </select>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {isSubmitting ? "Adding..." : "Add Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- STAFF LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No staff added yet.</p>
                <button onClick={() => setShowAddForm(true)} className="text-blue-600 font-medium mt-2 hover:underline">
                    Add your first employee
                </button>
            </div>
        ) : (
            staff.map((member) => (
            <div key={member.id} className={`bg-white rounded-lg shadow-sm border p-6 transition-opacity ${member.status === 'inactive' ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {member.name.charAt(0)}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                }`}>
                    {member.status}
                </span>
                </div>

                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-4 capitalize">{member.role}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {member.phone || "No phone"}
                </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                <button 
                    onClick={() => handleToggleStatus(member.id, member.status)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition-colors ${
                        member.status === 'active' 
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                    <Power className="h-4 w-4" />
                    {member.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remove Staff"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  )
}