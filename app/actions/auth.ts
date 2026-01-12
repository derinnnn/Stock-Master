'use server'

import { createClient } from '../utils/supabase/server'

// --- TYPES ---

export type SignupFormData = {
  businessName: string
  ownerName: string
  phoneNumber: string
  email: string
  password: string
  confirmPassword?: string
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
        full_name: data.ownerName, // We save the Owner Name in the user metadata
      },
    },
  })

  if (authError) {
    console.error('Auth Error:', authError.message)
    return { success: false, error: authError.message }
  }

  // 3. Create the Business Profile in your Database Table
  if (authData.user) {
    const { error: dbError } = await supabase
      .from('businesses')
      .insert({
        id: authData.user.id, // Links this business to the login user
        business_name: data.businessName,
        phone_number: data.phoneNumber
      })

    if (dbError) {
      console.error('DB Error:', dbError.message)
      return { success: false, error: 'Account created, but business profile failed.' }
    }
  }

  // 4. Return success so the frontend can redirect
  return { success: true }
}

export async function signinBusiness(data: SigninFormData) {
  const supabase = await createClient()

  // 1. Attempt to sign in with email and password
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  // 2. Handle errors
  if (error) {
    console.error('Login Error:', error.message)
    return { success: false, error: error.message }
  }

  // 3. Success (Next.js handles the session cookies automatically)
  return { success: true }
}

// app/actions/auth.ts

import { redirect } from 'next/navigation'

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/signin')
}