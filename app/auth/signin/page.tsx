"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { signinBusiness } from "@/app/actions/auth"

export default function SignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await signinBusiness(formData)

      if (response.success) {
        router.push("/dashboard")
        router.refresh()
      } else {
        setError(response.error || "Invalid email or password")
      }
    } catch (err) {
      setError("An unexpected error occurred")
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* ODIN BRANDING HEADER */}
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
            {/* Subtle Texture Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-blue-700 opacity-20 transform -skew-y-6 origin-top-left"></div>
            
            <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white tracking-tight">Odin</h1>
                <p className="text-blue-100 mt-2 text-sm font-medium">The All-Seeing Eye for Your Business</p>
            </div>
        </div>

        <div className="p-8">
            <div className="mb-6 text-center">
                <p className="text-gray-500 text-sm">
                    Stop flying blind. Gain total visibility into your sales, expenses, and profit today.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                    required
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Password
                </label>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
                    <span className="block w-2 h-2 bg-red-600 rounded-full"></span>
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Access Dashboard"}
            </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-bold hover:underline">
                    Register your business
                    </Link>
                </p>
            </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                Built for the 2025 Finance Act Compliance
            </p>
        </div>
      </div>
    </div>
  )
}