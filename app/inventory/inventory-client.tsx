"use client"

import { useState } from "react"
import { Search, Edit, Plus, Loader2, Package, Filter } from "lucide-react"
import { addProduct, updateProduct } from "@/app/actions/inventory"

type InventoryItem = {
  id: string
  name: string
  stock: number
  price: number
  cost_price: number
  category: string
  min_stock?: number
}

// UPDATE: Accept businessTags prop
export default function InventoryClient({ 
  initialInventory, 
  businessTags = [] // Default to empty array if missing
}: { 
  initialInventory: InventoryItem[], 
  businessTags?: string[] 
}) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory || [])
  const [searchTerm, setSearchTerm] = useState("")
  
  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Edit Mode
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const filteredInventory = inventory.filter(item => 
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 text-sm">Manage products, stock & prices</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap text-sm"
            >
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Item</span>
            </button>
        </div>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {filteredInventory.map(item => {
            const lowStockLimit = item.min_stock || 5
            const isLowStock = item.stock < lowStockLimit
            return (
                <div key={item.id} onClick={() => handleEditClick(item)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm active:scale-98 transition-transform">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                        </div>
                        <span className="text-blue-600 font-bold">₦{item.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                        <div>
                             <p className="text-xs text-gray-400 mb-1">Stock Level</p>
                             <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold px-2 py-1 rounded-md ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {item.stock} Units
                                </span>
                                {isLowStock && <span className="text-[10px] text-red-500 font-bold">LOW</span>}
                             </div>
                        </div>
                        <button className="text-gray-400">
                            <Edit className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )
        })}
      </div>

      {/* DESKTOP VIEW (TABLE) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Product</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Category</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Stock</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Selling (₦)</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase">Cost (₦)</th>
              <th className="p-4 font-semibold text-xs text-gray-500 uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map(item => {
                const lowStockLimit = item.min_stock || 5
                const isLowStock = item.stock < lowStockLimit
                return (
                  <tr key={item.id} className="hover:bg-gray-50 group">
                    <td className="p-4 font-medium text-gray-900">{item.name}</td>
                    <td className="p-4 text-gray-500 text-sm">{item.category}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isLowStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {item.stock} Units
                        </span>
                        {isLowStock && <span className="ml-2 text-[10px] text-red-500 font-bold">LOW</span>}
                    </td>
                    <td className="p-4 font-medium text-gray-900">₦{item.price.toLocaleString()}</td>
                    <td className="p-4 text-gray-500 text-sm">₦{item.cost_price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                        <button 
                            onClick={() => handleEditClick(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Edit / Restock
                        </button>
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900">
                        {editingItem ? "Edit Product / Restock" : "Add New Product"}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><Filter className="h-5 w-5 rotate-45" /></button>
                </div>
                
                <form action={async (formData) => {
                    setIsSaving(true)
                    let result;
                    if (editingItem) {
                        result = await updateProduct(editingItem.id, formData)
                    } else {
                        result = await addProduct(formData)
                    }
                    
                    setIsSaving(false)
                    if (result.success) {
                        setShowModal(false)
                        window.location.reload()
                    } else {
                        alert("Error: " + result.error)
                    }
                }} className="p-6 space-y-4 overflow-y-auto">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Product Name</label>
                        <input name="name" defaultValue={editingItem?.name} required className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {/* UPDATED: Category Input with Dynamic Tags */}
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Category</label>
                            <input 
                                name="category" 
                                list="categories" 
                                required 
                                defaultValue={editingItem?.category}
                                placeholder="Select or Type..." 
                                className="w-full border p-2.5 rounded-lg text-sm bg-white"
                            />
                            <datalist id="categories">
                                {/* 1. Show User's Custom Tags (from Signup) */}
                                {businessTags.map(tag => (
                                    <option key={tag} value={tag} />
                                ))}
                                {/* 2. Show Default Fallbacks */}
                                <option value="Drinks" />
                                <option value="Food" />
                                <option value="Electronics" />
                                <option value="Services" />
                                <option value="General" />
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Current Stock</label>
                            <input name="stock" type="number" required defaultValue={editingItem?.stock || 0} className="w-full border p-2.5 rounded-lg text-sm font-bold text-blue-900 bg-blue-50" />
                            <p className="text-[10px] text-gray-500 mt-1">Update this number to restock</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Selling Price (₦)</label>
                            <input name="price" type="number" required defaultValue={editingItem?.price} className="w-full border p-2.5 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Cost Price (₦)</label>
                            <input name="cost" type="number" required defaultValue={editingItem?.cost_price} className="w-full border p-2.5 rounded-lg text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-red-600 uppercase mb-1.5">Low Stock Alert Level</label>
                        <input name="minStock" type="number" defaultValue={editingItem?.min_stock || 5} className="w-full border p-2.5 rounded-lg text-sm bg-red-50 text-red-900 border-red-100" />
                        <p className="text-[10px] text-gray-500 mt-1">Alert me when stock falls below this</p>
                    </div>

                    <button 
                        disabled={isSaving}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 mt-4"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Package className="h-5 w-5" />}
                        {editingItem ? "Update Product" : "Save Product"}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}