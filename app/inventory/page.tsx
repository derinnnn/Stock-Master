import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import InventoryClient from "./inventory-client"

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Please log in</div>

  // 1. Fetch Inventory Items
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('business_id', user.id)
    .order('name', { ascending: true })

  // 2. Fetch Business Tags (NEW)
  const { data: business } = await supabase
    .from('businesses')
    .select('inventory_tags')
    .eq('id', user.id)
    .single()

  return (
    <AppLayout>
      <InventoryClient 
        initialInventory={inventory || []} 
        businessTags={business?.inventory_tags || []} // <--- Passing the tags here
      />
    </AppLayout>
  )
}