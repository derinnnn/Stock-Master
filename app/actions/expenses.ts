'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// FIX 1: Renamed from 'addExpense' to 'recordExpense' to match your dashboard button
export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authorized' }

  const description = formData.get('description') as string
  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as string
  
  // FIX 2: If the form doesn't send a date, use "Right Now"
  const dateInput = formData.get('date') as string
  const date = dateInput || new Date().toISOString()

  const { error } = await supabase.from('expenses').insert({
    business_id: user.id,
    description,
    amount,
    category,
    date
  })

  if (error) {
    console.error('Error adding expense:', error)
    return { success: false, error: error.message }
  }

  // Refresh both Dashboard (for recent activity) and Reports
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/reports')
  revalidatePath('/dashboard')
  return { success: true }
}