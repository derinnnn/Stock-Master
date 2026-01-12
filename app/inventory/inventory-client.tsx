"use client"

import { useState } from "react"
import { Search, Plus, Edit, AlertTriangle, Save, X } from "lucide-react"
import { updateStockLevel, addInventoryItem } from "@/app/actions/inventory"

// Type definition for our data
type Item = {
  id: string
  name: string
  stock: number
  min_stock: number 
  price: number        // Selling Price
  cost_price?: number  // Cost Price (Optional in type for now, but saved in DB)
  unit: string
  category: string
}

export default function InventoryClient({ initialInventory }: { initialInventory: Item[] }) {
  const [inventory, setInventory] = useState(initialInventory)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Filter logic
  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockItems = inventory.filter((item) => item.stock <= item.min_stock)

  // Handle Quick Stock Update
  const handleStockUpdate = async (id: string, newStock: number) => {
    // Optimistic update (update UI immediately)
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item)))
    setEditingItem(null)

    // Send to server
    await updateStockLevel(id, newStock)
  }

  return (
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

      {/* --- ADD ITEM MODAL / FORM --- */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
                setIsSaving(true)
                const result = await addInventoryItem(formData)
                setIsSaving(false)
                if (result.success) {
                    setShowAddForm(false)
                    // Reload to fetch the new item with its cost price from the server
                    window.location.reload() 
                } else {
                    alert("Failed to add item")
                }
            }} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Name</label>
                <input name="name" required className="w-full border rounded p-2" placeholder="e.g. Rice (50kg)" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Category</label>
                   <input name="category" required className="w-full border rounded p-2" placeholder="e.g. Grains" />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Unit</label>
                   <select name="unit" className="w-full border rounded p-2">
                     <option value="piece">Piece</option>
                     <option value="pack">Pack</option>
                     <option value="carton">Carton</option>
                     <option value="kg">Kg</option>
                     <option value="liter">Liter</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Current Stock</label>
                    <input name="stock" type="number" required className="w-full border rounded p-2" placeholder="0" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Min Stock Alert</label>
                    <input name="minStock" type="number" required className="w-full border rounded p-2" placeholder="10" />
                 </div>
              </div>

              {/* UPDATED: Split Price Section for Profit Tracking */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-600">Cost Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₦</span>
                        <input name="costPrice" type="number" required className="w-full border rounded p-2 pl-7" placeholder="0" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Buying Price</p>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-blue-600">Selling Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₦</span>
                        <input name="sellingPrice" type="number" required className="w-full border rounded p-2 pl-7" placeholder="0" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Customer Price</p>
                </div>
              </div>

              <button disabled={isSaving} type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                {isSaving ? "Saving..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? "No products found matching search." : "No inventory yet. Click 'Add Product' to start."}
                    </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
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
                            onBlur={(e) => handleStockUpdate(item.id, Number(e.target.value) || 0)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                handleStockUpdate(item.id, Number((e.target as HTMLInputElement).value) || 0)
                                }
                            }}
                            autoFocus
                            />
                        </div>
                        ) : (
                        <div className="text-sm text-gray-900">
                            {item.stock}
                        </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{item.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {item.stock <= item.min_stock ? (
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
                        Edit Stock
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}