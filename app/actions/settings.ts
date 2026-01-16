'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBusinessSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const phone = formData.get('phone') as string
  const currency = formData.get('currency') as string
  const taxRate = formData.get('taxRate')

  // FIX: Map 'name' to 'business_name'
  const { error } = await supabase
    .from('businesses')
    .upsert({
      id: user.id,
      business_name: name, // <--- CHANGED THIS LINE
      address,
      phone,
      currency,
      tax_rate: Number(taxRate)
    })

  if (error) {
    console.error("Settings Save Error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/sales-entry')
  revalidatePath('/sales-history')
  
  return { success: true }
}