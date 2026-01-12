import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import ReportsClient from "./reports-client"

export default async function ReportsPage() {
  const supabase = await createClient()

  // 1. Fetch Sales Data with PROFIT
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: sales, error } = await supabase
    .from('sales')
    .select('*')
    .eq('business_id', user?.id)
    .order('sold_at', { ascending: true })

  if (error || !sales) {
    return <AppLayout><div>Error loading reports</div></AppLayout>
  }

  // 2. Perform Calculations
  const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalItemsSold = sales.reduce((sum, sale) => sum + Number(sale.quantity), 0)
  
  // NEW: Sum up the actual profit from every transaction
  const totalGrossProfit = sales.reduce((sum, sale) => sum + Number(sale.profit), 0)

  // Calculate Average
  const averageMonthlyRevenue = totalRevenue // (Simplify for now)

  // Group by Month (for Chart)
  const monthMap = new Map<string, number>()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  const currentMonthIndex = new Date().getMonth()
  for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      monthMap.set(months[d.getMonth()], 0)
  }

  sales.forEach(sale => {
      const date = new Date(sale.sold_at)
      const monthName = months[date.getMonth()]
      if (monthMap.has(monthName)) {
          monthMap.set(monthName, (monthMap.get(monthName) || 0) + Number(sale.total_amount))
      }
  })

  const salesByMonth = Array.from(monthMap).map(([month, total]) => ({ month, total }))

  // Group by Product
  const productMap = new Map<string, { quantity: number; revenue: number }>()
  
  sales.forEach(sale => {
      const current = productMap.get(sale.product_name) || { quantity: 0, revenue: 0 }
      productMap.set(sale.product_name, {
          quantity: current.quantity + sale.quantity,
          revenue: current.revenue + Number(sale.total_amount)
      })
  })

  const topProducts = Array.from(productMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

  // 3. Package Data
  const reportData = {
      totalRevenue,
      totalGrossProfit, // Passing the real profit to the frontend
      totalItemsSold,
      averageMonthlyRevenue,
      salesByMonth,
      topProducts
  }

  return (
    <AppLayout>
      <ReportsClient data={reportData} />
    </AppLayout>
  )
}