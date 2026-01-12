import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import SalesHistoryClient from "./history-client"

export default async function SalesHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all sales, newest first
  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .eq('business_id', user?.id)
    .order('sold_at', { ascending: false })

  return (
    <AppLayout>
      <SalesHistoryClient initialSales={sales || []} />
    </AppLayout>
  )
}