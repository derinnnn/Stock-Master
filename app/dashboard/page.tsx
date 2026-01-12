import { createClient } from "./../utils/supabase/server"
import AppLayout from "../components/AppLayout"
import { Package, AlertTriangle, ShoppingCart, TrendingUp } from "lucide-react"

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Get Real Inventory Counts
  const { count: totalItems } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', user?.id)

  const { count: lowStockCount } = await supabase
    .from('inventory')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', user?.id)
    .lt('stock', 10) // Assuming low stock is < 10 for now (or use min_stock column if you added it)

  // 3. Get Recent Items (Real Data)
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

          {/* Placeholders for Sales (Since we don't have sales table yet) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦0</h3>
               </div>
               <div className="p-2 bg-blue-50 rounded-lg">
                 <ShoppingCart className="h-6 w-6 text-blue-600" />
               </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">Sales tracking coming soon</p>
          </div>
          
           <div className="bg-white p-6 rounded-lg shadow-sm border opacity-60">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm font-medium text-gray-600">This Month</p>
                 <h3 className="text-2xl font-bold text-gray-900 mt-2">₦0</h3>
               </div>
               <div className="p-2 bg-purple-50 rounded-lg">
                 <TrendingUp className="h-6 w-6 text-purple-600" />
               </div>
             </div>
             <p className="text-xs text-gray-500 mt-2">Reports coming soon</p>
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
                    <span className="text-green-600 font-medium">₦{item.price}</span>
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