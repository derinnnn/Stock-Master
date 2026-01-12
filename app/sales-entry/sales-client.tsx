"use client"

import { useState } from "react"
import { ShoppingCart, Plus, CheckCircle } from "lucide-react"
import { recordSale } from "@/app/actions/sales"

type InventoryItem = {
  id: string
  name: string
  stock: number
  price: number
  unit: string
}

export default function SalesEntryClient({ inventory }: { inventory: InventoryItem[] }) {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Find the full item object based on the selection
  const selectedItem = inventory.find(item => item.id === selectedProductId)
  const total = selectedItem ? selectedItem.price * quantity : 0

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setSuccessMessage("")
    
    // Add hidden data that the server needs
    formData.append('price', selectedItem?.price.toString() || "0")
    formData.append('productName', selectedItem?.name || "")

    const result = await recordSale(formData)
    
    if (result.success) {
      setSuccessMessage("Sale recorded successfully!")
      setQuantity(1)
      setSelectedProductId("") // Reset form
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
    } else {
      alert(result.error || "Failed to record sale")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Entry</h1>
        <p className="text-gray-600">Record a new transaction</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: The Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">New Sale</h2>
          
          <form action={handleSubmit} className="space-y-4">
            
            {/* Product Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
              <select 
                name="productId"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2 border rounded-md bg-white"
                required
              >
                <option value="">-- Choose a product --</option>
                {inventory.length === 0 ? (
                  <option disabled>No items in stock (Go to Inventory to add)</option>
                ) : (
                  inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} — ₦{item.price} ({item.stock} {item.unit}s left)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input 
                name="quantity"
                type="number" 
                min="1" 
                max={selectedItem?.stock || 999}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border rounded-md"
                disabled={!selectedProductId}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={!selectedProductId || isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? "Recording..." : (
                <>
                  <ShoppingCart className="h-5 w-5" /> Confirm Sale
                </>
              )}
            </button>
          </form>

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          )}
        </div>

        {/* RIGHT: The Receipt Preview */}
        <div className="bg-gray-50 p-6 rounded-lg border flex flex-col justify-center items-center text-center">
          {selectedItem ? (
            <div className="w-full">
              <p className="text-gray-500 text-sm uppercase tracking-wide mb-4">Transaction Preview</p>
              <div className="text-3xl font-bold text-gray-900 mb-1">{selectedItem.name}</div>
              <div className="text-gray-600 mb-6">{quantity} x ₦{selectedItem.price.toLocaleString()}</div>
              
              <div className="border-t border-gray-200 pt-4 w-full flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">₦{total.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Select a product to calculate total</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}