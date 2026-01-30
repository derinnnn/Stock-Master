'use server'

import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

// --- TYPES ---

export type SignupFormData = {
  businessName: string
  ownerName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword?: string
  tags: string[] // <--- NEW: Array of custom tags
}

export type SigninFormData = {
  email: string
  password: string
}

// --- ACTIONS ---

export async function signupBusiness(data: SignupFormData) {
  const supabase = await createClient()

  // 1. Basic Password Validation
  if (data.password !== data.confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  // 2. Create the User in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.ownerName,
      },
    },
  })

  if (authError) {
    console.error('Auth Error:', authError.message)
    return { success: false, error: authError.message }
  }

  // 3. Create the Business Profile with Tags
  if (authData.user) {
    const { error: dbError } = await supabase
      .from('businesses')
      .insert({
        id: authData.user.id,
        business_name: data.businessName,
        phone_number: data.phoneNumber,
        inventory_tags: data.tags // <--- NEW: Saving the tags to DB
      })

    if (dbError) {
      console.error('DB Error:', dbError.message)
      // Note: User is created in Auth, but DB profile failed. 
      // In a production app, you might want to delete the Auth user here to "rollback".
      return { success: false, error: 'Account created, but business profile failed.' }
    }
  }

  return { success: true }
}

export async function signinBusiness(data: SigninFormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    console.error('Login Error:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/signin')
}