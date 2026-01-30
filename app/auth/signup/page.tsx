"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Store, Plus, X } from "lucide-react"
import { signupBusiness, type SignupFormData } from "@/app/actions/auth"

export default function RegisterNewBusiness() {
  // Form State for Text Inputs
  const [formData, setFormData] = useState<Omit<SignupFormData, 'tags'>>({
    businessName: "",
    ownerName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Separate State for Tags logic
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Tag Handlers
  const handleAddTag = () => {
    const cleanTag = tagInput.trim()
    if (cleanTag && tags.length < 5 && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submit
      handleAddTag()
    }
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Combine text data with the tags array
      const fullData: SignupFormData = {
        ...formData,
        tags: tags
      }

      const response = await signupBusiness(fullData)

      if (response.success) {
        setSuccess(true)
        setFormData({
          businessName: "",
          ownerName: "",
          phoneNumber: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
        setTags([]) // Clear tags
        
        // Redirect
        setTimeout(() => {
          window.location.href = "/auth/signin?registered=true"
        }, 2000)
      } else {
        setError(response.error || "Registration failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Business</h1>
          <p className="text-gray-600 mt-2">Start managing your inventory today</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-200">
            Business account created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., John's General Store" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
            <input name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your full name" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-gray-500 text-xs">(optional)</span></label>
            <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., 08012345678" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 6 characters" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm your password" required />
          </div>

          {/* --- NEW: TOP 5 TAGS SELECTOR --- */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-blue-800 uppercase">Top 5 Categories</label>
                <span className={`text-xs font-bold ${tags.length >= 5 ? 'text-red-500' : 'text-blue-600'}`}>{tags.length}/5</span>
            </div>
            <p className="text-[10px] text-blue-600 mb-2">Add categories you sell often (e.g. Wigs, Cement, Rice)</p>
            
            <div className="flex gap-2 mb-3">
                <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={tags.length >= 5}
                    placeholder={tags.length >= 5 ? "Limit reached" : "Type and press Enter..."} 
                    className="flex-1 px-3 py-2 border border-blue-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" 
                />
                <button 
                    type="button" 
                    onClick={handleAddTag}
                    disabled={tags.length >= 5 || !tagInput.trim()}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <span key={i} className="bg-white border border-blue-200 text-blue-800 text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            {tag}
                            <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:bg-red-50 hover:text-red-500 rounded-full p-0.5 transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
          </div>
          {/* -------------------------------- */}

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors font-semibold shadow-sm"
          >
            {isLoading ? "Creating Account..." : "Register Business"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}