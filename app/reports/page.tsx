import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import ReportsClient from "./reports-client"
import { format, subMonths, startOfMonth, parseISO } from "date-fns"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Calculate Date Range (Last 12 Months)
  const today = new Date()
  const twelveMonthsAgo = subMonths(startOfMonth(today), 11).toISOString() // Go back 11 months + current month

  // 2. Fetch Data (Sales & Expenses from last 12 months only)
  const { data: sales } = await supabase
    .from('sales')
    .select('*')
    .eq('business_id', user?.id)
    .gte('sold_at', twelveMonthsAgo) // Filter by date
    .order('sold_at', { ascending: true })

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('business_id', user?.id)
    .gte('date', twelveMonthsAgo)
    .order('date', { ascending: false })

  const safeSales = sales || []
  const safeExpenses = expenses || []

  // 3. Calculate Totals
  const totalRevenue = safeSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
  const totalGrossProfit = safeSales.reduce((sum, sale) => sum + Number(sale.profit), 0)
  const totalOperatingExpenses = safeExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  const totalItemsSold = safeSales.reduce((sum, sale) => sum + Number(sale.quantity), 0)
  
  // 4. Robust Graph Data (Last 12 Months)
  const monthMap = new Map<string, number>()
  const labels: string[] = []

  // Generate labels using date-fns (Deterministic)
  for (let i = 11; i >= 0; i--) {
      const d = subMonths(today, i)
      const label = format(d, 'MMM yyyy') // e.g., "Jan 2026"
      labels.push(label)
      monthMap.set(label, 0)
  }

  // Map Sales to these Labels
  safeSales.forEach(sale => {
      // Parse the DB timestamp safely
      const saleDate = new Date(sale.sold_at)
      const label = format(saleDate, 'MMM yyyy')
      
      if (monthMap.has(label)) {
          monthMap.set(label, (monthMap.get(label) || 0) + Number(sale.total_amount))
      }
  })

  // Convert to Array
  const salesByMonth = labels.map(label => ({
      month: label,
      total: monthMap.get(label) || 0
  }))

  // 5. Top Products Logic
  const productMap = new Map<string, { quantity: number; revenue: number }>()
  safeSales.forEach(sale => {
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

  // 6. Package Data
  const reportData = {
      totalRevenue,
      totalGrossProfit,
      totalOperatingExpenses,
      totalItemsSold,
      salesByMonth,
      topProducts,
      expensesList: safeExpenses,
      rawSales: safeSales // Passing raw sales for the Export CSV function
  }

  return (
    <AppLayout>
      <ReportsClient data={reportData} />
    </AppLayout>
  )
}