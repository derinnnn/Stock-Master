import AppLayout from "../components/AppLayout"
import { Package, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react"

// Mock data
const stats = [
  {
    title: "Total Items",
    value: "1,234",
    change: "+12%",
    changeType: "positive" as const,
    icon: Package,
  },
  {
    title: "Low Stock Items",
    value: "23",
    change: "+5",
    changeType: "negative" as const,
    icon: AlertTriangle,
  },
  {
    title: "Today's Sales",
    value: "₦45,600",
    change: "+8%",
    changeType: "positive" as const,
    icon: ShoppingCart,
  },
  {
    title: "This Month",
    value: "₦1,234,500",
    change: "+15%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

const recentSales = [
  { id: 1, item: "Rice (50kg)", quantity: 2, amount: "₦45,000", time: "2 hours ago" },
  { id: 2, item: "Cooking Oil (5L)", quantity: 5, amount: "₦12,500", time: "3 hours ago" },
  { id: 3, item: "Sugar (1kg)", quantity: 10, amount: "₦8,000", time: "5 hours ago" },
]

const lowStockItems = [
  { id: 1, name: "Tomato Paste", current: 5, minimum: 20, unit: "pieces" },
  { id: 2, name: "Bread", current: 8, minimum: 30, unit: "loaves" },
  { id: 3, name: "Milk (1L)", current: 12, minimum: 25, unit: "pieces" },
]

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your business performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.changeType === "positive" ? "bg-green-100" : "bg-red-100"}`}>
                    <Icon className={`h-6 w-6 ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`} />
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{sale.item}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {sale.quantity} • {sale.time}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">{sale.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.current} {item.unit} remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-red-600 font-medium">Low Stock</p>
                      <p className="text-xs text-gray-500">Min: {item.minimum}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
