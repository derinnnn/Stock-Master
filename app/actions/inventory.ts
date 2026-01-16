'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. ADD NEW ITEM
// We renamed this to 'addProduct' to match your Inventory Client
export async function addProduct(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authorized' }

  // 1. Capture data from the form (using the names from the new Modal)
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const stock = Number(formData.get('stock'))
  
  // FIX: Match the input names from the client form ('price' and 'cost')
  const price = Number(formData.get('price')) 
  const cost = Number(formData.get('cost'))

  // 2. Insert into Database
  // Note: We map 'price' from form -> 'price' or 'selling_price' in DB.
  // Based on your previous file, your DB column is likely named 'price'.
  const { error } = await supabase.from('inventory').insert({
    business_id: user.id,
    name,
    category,
    stock,
    price: price,          // Selling Price
    cost_price: cost,      // Cost Price
    min_stock: 5           // Default default alert level
  })

  if (error) {
    console.error('Error adding item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/inventory')
  revalidatePath('/sales-entry')
  return { success: true }
}

// 2. UPDATE PRICE (Used by the "Edit" pencil)
export async function updateProductPrice(id: string, newPrice: number) {
  const supabase = await createClient()
  
  // Update the 'price' column (or 'selling_price' if you renamed it)
  const { error } = await supabase
    .from('inventory')
    .update({ price: newPrice }) 
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/inventory')
  return { success: true }
}