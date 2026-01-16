'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

type CartItem = {
  id: string
  name: string
  quantity: number
  price: number 
  cost: number
}

export async function processCheckout(cart: CartItem[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Unauthorized' }

  // 1. Prepare Sales Data
  // FIX: We added 'product_id: item.id' below so the DB knows exactly what was sold.
  const salesData = cart.map(item => ({
    business_id: user.id,
    product_id: item.id,      // <--- THIS WAS MISSING!
    product_name: item.name,
    quantity: item.quantity,
    total_amount: item.price * item.quantity,
    profit: (item.price - item.cost) * item.quantity,
    sold_at: new Date().toISOString()
  }))

  // 2. Insert Sales
  const { error: salesError } = await supabase.from('sales').insert(salesData)
  
  if (salesError) {
    console.error("Sales Insert Error:", salesError)
    return { success: false, error: salesError.message }
  }

  // 3. Update Inventory (Deduct Stock)
  for (const item of cart) {
    const { data: currentItem } = await supabase
        .from('inventory')
        .select('stock')
        .eq('id', item.id)
        .single()
    
    if (currentItem) {
        await supabase
            .from('inventory')
            .update({ stock: currentItem.stock - item.quantity })
            .eq('id', item.id)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/inventory')
  return { success: true }
}

export async function updateProductPrice(id: string, newPrice: number) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('inventory')
        .update({ price: newPrice }) 
        .eq('id', id)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/inventory')
    revalidatePath('/sales-entry')
    return { success: true }
}