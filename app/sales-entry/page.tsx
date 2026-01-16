import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import SalesEntryClient from "./sales-client"

export default async function SalesEntryPage() {
  const supabase = await createClient()
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>Please log in</div>

  // 2. Fetch Inventory
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .gt('stock', 0)
    .order('name', { ascending: true })

  // 3. Fetch Business Details (New!)
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <AppLayout>
      <SalesEntryClient 
        inventory={inventory || []} 
        business={business || {}} // Pass business info
      />
    </AppLayout>
  )
}