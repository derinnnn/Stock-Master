'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authorized' }

  // Extract data from the form
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const currency = formData.get('currency') as string
  const taxRate = formData.get('taxRate')

  // Update the business table
  const { error } = await supabase
    .from('businesses')
    .update({
      name,
      address,
      phone,
      currency,
      tax_rate: Number(taxRate)
    })
    .eq('id', user.id) // Assuming business_id matches user_id for owner

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard') // Refresh dashboard to show new name
  return { success: true }
}