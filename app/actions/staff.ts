'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStaff(formData: FormData) {
  const supabase = await createClient()

  // 1. Get Current User (Business Owner)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authorized' }

  // 2. Extract Data
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string

  // 3. Save to Database
  const { error } = await supabase
    .from('staff')
    .insert({
      business_id: user.id,
      name,
      email,
      phone,
      role
    })

  if (error) {
    console.error('Error adding staff:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/staff-management')
  return { success: true }
}

export async function toggleStaffStatus(staffId: string, currentStatus: string) {
  const supabase = await createClient()
  
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('staff')
    .update({ status: newStatus })
    .eq('id', staffId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/staff-management')
  return { success: true }
}

export async function deleteStaff(staffId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', staffId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/staff-management')
  return { success: true }
}