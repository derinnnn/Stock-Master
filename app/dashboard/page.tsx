import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import { Package, AlertTriangle, ShoppingCart, TrendingUp, ArrowRight, DollarSign } from "lucide-react"
import Link from "next/link"
import ExpenseButton from "./expense-modal"

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div>Please log in</div>

  // 1. Get Today's Date helpers
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // 2. FETCH DATA IN PARALLEL (Faster)
  const [inventoryRes, salesRes] = await Promise.all([
    // A. Fetch Inventory (to calculate Low Stock dynamically)
    supabase.from('inventory').select('*').eq('business_id', user.id),
    
    // B. Fetch Sales (This Month)
    supabase.from('sales').select('*').eq('business_id', user.id).gte('sold_at', startOfMonth).order('sold_at', { ascending: false })
  ])

  const inventory = inventoryRes.data || []
  const sales = salesRes.data || []

  // 3. CALCULATE STATS
  
  // A. Inventory Stats
  const totalItems = inventory.length
  // Logic: Use the item's custom 'min_stock' OR default to 5
  const lowStockItems = inventory.filter(item => item.stock < (item.min_stock || 5))
  const lowStockCount = lowStockItems.length

  // B. Sales Stats
  let monthSales = 0
  let todaySales = 0
  let todayOrdersCount = 0
  const todaySalesData: any[] = []

  sales.forEach(sale => {
    // Add to Month Total
    monthSales += Number(sale.total_amount)
    
    // Check if it's Today
    if (sale.sold_at >= startOfDay) {
        todaySales += Number(sale.total_amount)
        todayOrdersCount += 1 // Count individual items sold today
        todaySalesData.push(sale)
    }
  })

  // Group unique timestamps for "Orders" count (approximate)
  const uniqueTodayOrders = new Set(todaySalesData.map(s => s.sold_at)).size

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* HEADER SECTION - NOW WITH EXPENSE BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
               <p className="text-gray-600">Overview of your business performance</p>
            </div>
            
            {/* The Button Component you imported */}
            <ExpenseButton /> 
        </div>
        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Total Items */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalItems}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 2. Low Stock (Red Alert) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Restock Needed</p>
                <h3 className={`text-2xl font-bold mt-2 ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {lowStockCount}
                </h3>
              </div>
              <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <AlertTriangle className={`h-6 w-6 ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
            </div>
            {lowStockCount > 0 && <p className="text-xs text-red-500 mt-1 font-medium">Action required</p>}
          </div>

          {/* 3. Today's Sales */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{todaySales.toLocaleString()}</h3>
               </div>
               <div className="p-2 bg-blue-50 rounded-lg">
                 <ShoppingCart className="h-6 w-6 text-blue-600" />
               </div>
             </div>
             <p className="text-xs text-blue-600 mt-2 font-medium">{uniqueTodayOrders} orders today</p>
          </div>
          
          {/* 4. Month Sales */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">This Month</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{monthSales.toLocaleString()}</h3>
               </div>
               <div className="p-2 bg-purple-50 rounded-lg">
                 <TrendingUp className="h-6 w-6 text-purple-600" />
               </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">Gross Revenue</p>
          </div>
        </div>

        {/* --- SPLIT VIEW: ALERTS vs FEED --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: Low Stock List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" /> Low Stock Alerts
                    </h3>
                    <Link href="/inventory" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        Manage <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="flex-1">
                    {lowStockCount === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                            <CheckCircleIcon /> 
                            <p className="mt-2 text-sm">Inventory is healthy!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {lowStockItems.slice(0, 5).map(item => (
                                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-500 uppercase">{item.category}</p>
                                    </div>
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                                        {item.stock} Left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Live Feed (Replaced 'Recently Added') */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" /> Recent Sales
                    </h3>
                    <Link href="/sales-history" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        View All <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="flex-1">
                    {sales.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                            <DollarSign className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            <p className="text-sm">No sales this month.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {sales.slice(0, 5).map((sale, i) => (
                                <div key={i} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {sale.quantity}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm line-clamp-1">{sale.product_name}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(sale.sold_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-green-600 text-sm">
                                        +₦{sale.total_amount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </AppLayout>
  )
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}