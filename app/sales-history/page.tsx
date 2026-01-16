import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import SalesHistoryClient from "./history-client"

export default async function SalesHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Please log in</div>

  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('business_id', user.id)
    .order('sold_at', { ascending: false })

  // FETCH BUSINESS DETAILS
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <AppLayout>
      <SalesHistoryClient 
        initialSales={sales || []} 
        business={business || {}} // Pass data
      />
    </AppLayout>
  )
}