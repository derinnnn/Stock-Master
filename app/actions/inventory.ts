'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. ADD NEW ITEM
export async function addProduct(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authorized' }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const stock = Number(formData.get('stock'))
  const price = Number(formData.get('price')) 
  const cost = Number(formData.get('cost'))
  
  // FIX: Read the Low Stock level from the form, or default to 5
  const minStock = Number(formData.get('minStock')) || 5

  const { error } = await supabase.from('inventory').insert({
    business_id: user.id,
    name,
    category,
    stock,
    price: price,
    cost_price: cost,
    min_stock: minStock  // <--- Saving your custom limit
  })

  if (error) {
    console.error('Error adding item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/inventory')
  revalidatePath('/sales-entry')
  return { success: true }
}

// 2. UPDATE PRICE
export async function updateProductPrice(id: string, newPrice: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inventory')
    .update({ price: newPrice }) 
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/inventory')
  return { success: true }
}