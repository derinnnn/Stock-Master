'use server'

import { createClient } from './../utils/supabase/server' // Ensure this path matches your structure
import { revalidatePath } from 'next/cache'

// Define the shape of our Inventory Item
export type InventoryItem = {
  id: string
  name: string
  category: string
  stock: number
  price: number        // Selling Price
  cost_price: number   // Cost Price (Hidden from customer)
  minStock: number
  unit: string
}

// 1. ADD NEW ITEM (Now with Profit Tracking)
export async function addInventoryItem(formData: FormData) {
  const supabase = await createClient()

  // Get the current user so we know who owns this item
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authorized' }

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const stock = Number(formData.get('stock'))
  
  // UPDATED: Capture both Cost and Selling Price
  // Note: The form must send 'sellingPrice' and 'costPrice'
  const sellingPrice = Number(formData.get('sellingPrice'))
  const costPrice = Number(formData.get('costPrice'))
  
  const minStock = Number(formData.get('minStock'))
  const unit = formData.get('unit') as string

  const { error } = await supabase.from('inventory').insert({
    business_id: user.id, // Link to the user
    name,
    category,
    stock,
    price: sellingPrice,      // Maps to 'price' column (Selling)
    cost_price: costPrice,    // Maps to 'cost_price' column (Buying)
    min_stock: minStock,
    unit
  })

  if (error) {
    console.error('Error adding item:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/inventory') // Refresh the page to show new data
  return { success: true }
}

// 2. UPDATE STOCK LEVEL
export async function updateStockLevel(itemId: string, newStock: number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('inventory')
    .update({ stock: newStock })
    .eq('id', itemId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/inventory')
  return { success: true }
}