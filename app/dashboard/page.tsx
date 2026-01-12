import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from "lucide-react"

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get Inventory Counts
  const { count: totalItems } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', user?.id)

  const { count: lowStockCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', user?.id)
    .lt('stock', 10) 

  // 2. Get Sales Data (For Today & This Month)
  const now = new Date()
  
  // Calculate Start of Month (YYYY-MM-01)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  
  // Calculate Start of Today (YYYY-MM-DD 00:00:00)
  // Note: This uses UTC. For strict Nigerian time, we'd adjust, but this is fine for MVP.
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  // Fetch sales from the start of the month until now
  const { data: recentSales } = await supabase
    .from('sales')
    .select('total_amount, sold_at')
    .eq('business_id', user?.id)
    .gte('sold_at', startOfMonth)

  // Calculate Totals in Javascript
  let monthSales = 0
  let todaySales = 0

  if (recentSales) {
    recentSales.forEach(sale => {
        monthSales += Number(sale.total_amount)
        if (sale.sold_at >= startOfDay) {
            todaySales += Number(sale.total_amount)
        }
    })
  }

  // 3. Get Recent Items for List
  const { data: recentItems } = await supabase
    .from('inventory')
    .select('*')
    .eq('business_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
           <p className="text-gray-600">Overview of your business performance</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Items */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{totalItems || 0}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{lowStockCount || 0}</h3>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Today's Sales (Active) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{todaySales.toLocaleString()}</h3>
               </div>
               <div className="p-2 bg-blue-50 rounded-lg">
                 <ShoppingCart className="h-6 w-6 text-blue-600" />
               </div>
             </div>
             <p className="text-xs text-green-600 mt-2 font-medium">Live Update</p>
          </div>
          
          {/* Month Sales (Active) */}
           <div className="bg-white p-6 rounded-lg shadow-sm border">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">This Month</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{monthSales.toLocaleString()}</h3>
               </div>
               <div className="p-2 bg-purple-50 rounded-lg">
                 <TrendingUp className="h-6 w-6 text-purple-600" />
               </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">Current billing cycle</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
           <h3 className="font-semibold text-gray-800 mb-4">Recently Added Inventory</h3>
           <div className="space-y-4">
             {recentItems && recentItems.length > 0 ? (
               recentItems.map((item) => (
                 <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                   <div>
                     <p className="font-medium text-gray-900">{item.name}</p>
                     <p className="text-sm text-gray-500">{item.stock} in stock</p>
                   </div>
                   <span className="text-green-600 font-medium">₦{item.price.toLocaleString()}</span>
                 </div>
               ))
             ) : (
               <p className="text-gray-500 text-sm">No items added yet. Go to Inventory to start!</p>
             )}
           </div>
        </div>
      </div>
    </AppLayout>
  )
}