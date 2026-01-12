import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import InventoryClient from "./inventory-client" // We'll create this next

export default async function InventoryPage() {
  const supabase = await createClient()
  
  // 1. Fetch Real Data from Supabase
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching inventory:", error)
  }

  // 2. Pass data to the Client Component
  // If no data exists (new account), 'inventory' will be empty array []
  return (
    <AppLayout>
       {/* We split this into a separate client component to handle the interactivity */}
      <InventoryClient initialInventory={inventory || []} />
    </AppLayout>
  )
}