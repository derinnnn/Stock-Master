'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: 'Not authorized' }

  const description = formData.get('description') as string
  const amount = Number(formData.get('amount'))
  const category = formData.get('category') as string
  const date = formData.get('date') as string // Format: YYYY-MM-DD

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

  revalidatePath('/reports')
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/reports')
  return { success: true }
}