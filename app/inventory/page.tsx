"use client"

import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { Search, Plus, Edit, AlertTriangle } from "lucide-react"

// Mock inventory data
const mockInventory = [
  { id: "1", name: "Rice (50kg)", stock: 45, minStock: 20, price: 22500, unit: "pack", category: "Grains" },
  { id: "2", name: "Cooking Oil (5L)", stock: 30, minStock: 15, price: 2500, unit: "piece", category: "Cooking" },
  { id: "3", name: "Sugar (1kg)", stock: 60, minStock: 25, price: 800, unit: "piece", category: "Sweeteners" },
  { id: "4", name: "Bread", stock: 8, minStock: 30, price: 500, unit: "piece", category: "Bakery" },
  { id: "5", name: "Milk (1L)", stock: 12, minStock: 25, price: 450, unit: "piece", category: "Dairy" },
  { id: "6", name: "Tomato Paste", stock: 5, minStock: 20, price: 300, unit: "piece", category: "Condiments" },
]

export default function Inventory() {
  const [inventory, setInventory] = useState(mockInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStock)

  const updateStock = (id: string, newStock: number) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, stock: Math.max(0, newStock) } : item)))
    setEditingItem(null)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <p className="text-gray-600">Manage your stock levels</p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-800">Low Stock Alert</h3>
            </div>
            <p className="text-red-700 text-sm">{lowStockItems.length} item(s) are running low on stock</p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">per {item.unit}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={item.stock}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            onBlur={(e) => updateStock(item.id, Number.parseInt(e.target.value) || 0)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                updateStock(item.id, Number.parseInt((e.target as HTMLInputElement).value) || 0)
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.stock} {item.unit}s
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.stock <= item.minStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingItem(item.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-8 text-gray-500">No products found matching your search.</div>
        )}
      </div>
    </AppLayout>
  )
}
