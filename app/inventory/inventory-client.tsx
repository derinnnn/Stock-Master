"use client"

import { useState } from "react"
import { Search, Edit2, Check, X, Plus, Loader2, Package } from "lucide-react"
import { updateProductPrice } from "@/app/actions/pos"
import { addProduct } from "@/app/actions/inventory"

type InventoryItem = {
  id: string
  name: string
  stock: number
  price: number
  cost_price: number
  category: string
  min_stock?: number
}

export default function InventoryClient({ initialInventory }: { initialInventory: InventoryItem[] }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory || [])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const filteredInventory = inventory.filter(item => 
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const startEditing = (item: InventoryItem) => {
    setEditingId(item.id)
    setTempPrice((item.price || 0).toString())
  }

  const cancelEditing = () => {
    setEditingId(null)
    setTempPrice("")
  }

  const savePrice = async (id: string) => {
    const newPrice = parseFloat(tempPrice)
    if (isNaN(newPrice)) return
    
    setInventory(prev => prev.map(item => item.id === id ? { ...item, price: newPrice } : item))
    setEditingId(null)

    setIsSaving(true)
    const result = await updateProductPrice(id, newPrice)
    if (!result.success) alert("Failed to save price.")
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track stock levels and edit prices</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
                <Plus className="h-4 w-4" /> Add Product
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Product</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Category</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Stock</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Price (₦)</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                        No products found.
                    </td>
                </tr>
            ) : (
                filteredInventory.map(item => {
                    const lowStockLimit = item.min_stock || 5
                    const isLowStock = item.stock < lowStockLimit
                    const isOutOfStock = item.stock === 0

                    return (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                        <td className="p-4 font-medium text-gray-900">{item.name}</td>
                        <td className="p-4 text-gray-500 text-sm">{item.category}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {item.stock} Units
                            </span>
                            {isLowStock && !isOutOfStock && (
                                <span className="ml-2 text-[10px] text-red-500 font-medium">Low (Limit: {lowStockLimit})</span>
                            )}
                        </td>
                        <td className="p-4">
                            {editingId === item.id ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        autoFocus
                                        type="number" 
                                        value={tempPrice}
                                        onChange={e => setTempPrice(e.target.value)}
                                        className="w-24 p-1 border border-blue-500 rounded text-sm shadow-sm"
                                        onKeyDown={(e) => { if (e.key === 'Enter') savePrice(item.id) }}
                                    />
                                    <button onClick={() => savePrice(item.id)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check className="h-4 w-4" /></button>
                                    <button onClick={cancelEditing} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><X className="h-4 w-4" /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startEditing(item)}>
                                    <span className="text-gray-900 font-medium">₦{(item.price || 0).toLocaleString()}</span>
                                    <Edit2 className="h-3 w-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            )}
                        </td>
                        <td className="p-4">
                            {isOutOfStock ? <span className="text-red-500 text-xs font-bold">Out of Stock</span> : <span className="text-green-500 text-xs font-bold">Active</span>}
                        </td>
                    </tr>
                )})
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">Add New Product</h2>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
                
                <form action={async (formData) => {
                    setIsAdding(true)
                    await addProduct(formData)
                    setIsAdding(false)
                    setShowAddModal(false)
                    window.location.reload()
                }} className="p-6 space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Product Name</label>
                        <input name="name" required className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {/* UPDATED: Custom Category Input */}
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Category</label>
                            <input 
                                name="category" 
                                list="categories" 
                                required 
                                placeholder="Type or Select..." 
                                className="w-full border p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <datalist id="categories">
                                <option value="Drinks" />
                                <option value="Food" />
                                <option value="Electronics" />
                                <option value="Services" />
                                <option value="Fashion" />
                                <option value="Health" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Initial Stock</label>
                            <input name="stock" type="number" required defaultValue="1" className="w-full border p-2.5 rounded-lg text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            {/* UPDATED: Explicit Labels */}
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Selling Price (₦)</label>
                            <input name="price" type="number" required className="w-full border p-2.5 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1.5">Cost Price (₦)</label>
                            <input name="cost" type="number" required className="w-full border p-2.5 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-red-600 uppercase mb-1.5">Low Alert</label>
                            <input name="minStock" type="number" defaultValue="5" className="w-full border p-2.5 rounded-lg text-sm bg-red-50 text-red-900 border-red-100" />
                        </div>
                    </div>

                    <button disabled={isAdding} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 mt-2">
                        {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        Save Product
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}