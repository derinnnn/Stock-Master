"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

// Define the shape of the user for the app
type User = {
  id: string
  email?: string
  businessName?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Create a client for the browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // 1. Check active session on load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Map Supabase user to our App user shape
        setUser({
          id: session.user.id,
          email: session.user.email,
          // We'll grab real business details later; for now, use metadata or defaults
          role: 'owner', 
          businessName: 'My Business' 
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkUser()

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          role: 'owner',
          businessName: 'My Business'
        })
        // If we just logged in, force a refresh to update server components
        if (event === 'SIGNED_IN') router.refresh()
      } else {
        setUser(null)
        // If we logged out, the Middleware handles the redirect, 
        // but we can help it here:
        if (event === 'SIGNED_OUT') router.push('/auth/signin')
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)