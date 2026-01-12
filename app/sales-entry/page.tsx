import { createClient } from "./../utils/supabase/server" // Fixed path
import AppLayout from "../components/AppLayout"
import SalesEntryClient from "./sales-client" // We will create this next

export default async function SalesEntryPage() {
  const supabase = await createClient()
  
  // 1. Fetch ONLY the user's real inventory
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .gt('stock', 0) // Only show items that are actually in stock
    .order('name', { ascending: true })

  return (
    <AppLayout>
      {/* Pass real data to the client component */}
      <SalesEntryClient inventory={inventory || []} />
    </AppLayout>
  )
}