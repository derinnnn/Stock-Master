'use server'

import { createClient } from './../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordSale(formData: FormData) {
  const supabase = await createClient()

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authorized' }

  // 2. Extract Data
  const productId = formData.get('productId') as string
  const quantity = Number(formData.get('quantity'))
  const sellingPrice = Number(formData.get('price')) // This is the Selling Price passed from the form
  const productName = formData.get('productName') as string

  // 3. Fetch Product Details (Stock & Cost Price)
  // We need 'cost_price' to calculate profit
  const { data: product } = await supabase
    .from('inventory')
    .select('stock, cost_price') 
    .eq('id', productId)
    .single()

  if (!product || product.stock < quantity) {
    return { success: false, error: 'Not enough stock available!' }
  }

  // 4. Calculate Financials
  const totalRevenue = sellingPrice * quantity
  const costPerUnit = product.cost_price || 0
  const totalCost = costPerUnit * quantity
  const totalProfit = totalRevenue - totalCost

  // 5. Record the Sale
  const { error: saleError } = await supabase
    .from('sales')
    .insert({
      business_id: user.id,
      product_id: productId,
      product_name: productName,
      quantity: quantity,
      total_amount: totalRevenue,
      cost_at_sale: totalCost, // Track historical cost
      profit: totalProfit      // Track exact profit
    })

  if (saleError) return { success: false, error: saleError.message }

  // 6. Deduct from Inventory
  const { error: stockError } = await supabase
    .from('inventory')
    .update({ stock: product.stock - quantity })
    .eq('id', productId)

  if (stockError) return { success: false, error: stockError.message }

  // 7. Refresh all relevant pages
  revalidatePath('/dashboard')
  revalidatePath('/inventory')
  revalidatePath('/sales-entry')
  revalidatePath('/reports')
  
  return { success: true }
}