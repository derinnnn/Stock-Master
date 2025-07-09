"use client"

import { useState } from "react"
import AppLayout from "../components/AppLayout"
import { Plus, Minus, ShoppingCart } from "lucide-react"

interface SaleItem {
  id: string
  name: string
  price: number
  quantity: number
  unit: "piece" | "pack"
}

// Mock inventory data
const inventory = [
  { id: "1", name: "Rice (50kg)", price: 22500, stock: 45, unit: "pack" as const },
  { id: "2", name: "Cooking Oil (5L)", price: 2500, stock: 30, unit: "piece" as const },
  { id: "3", name: "Sugar (1kg)", price: 800, stock: 60, unit: "piece" as const },
  { id: "4", name: "Bread", price: 500, stock: 25, unit: "piece" as const },
  { id: "5", name: "Milk (1L)", price: 450, stock: 40, unit: "piece" as const },
]

export default function SalesEntry() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)

  const addItem = () => {
    if (!selectedProduct) return

    const product = inventory.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = saleItems.find((item) => item.id === selectedProduct)

    if (existingItem) {
      setSaleItems((prev) =>
        prev.map((item) => (item.id === selectedProduct ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setSaleItems((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit,
        },
      ])
    }

    setSelectedProduct("")
  }

  const updateQuantity = (id: string, change: number) => {
    setSaleItems(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(0, item.quantity + change)
              return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
            }
            return item
          })
          .filter(Boolean) as SaleItem[],
    )
  }

  const removeItem = (id: string) => {
    setSaleItems((prev) => prev.filter((item) => item.id !== id))
  }

  const total = saleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const completeSale = () => {
    if (saleItems.length === 0) return

    // Mock sale completion
    setShowReceipt(true)
    setTimeout(() => {
      setSaleItems([])
      setShowReceipt(false)
      alert("Sale completed successfully!")
    }, 3000)
  }

  if (showReceipt) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Sale Receipt</h2>
            <p className="text-gray-600">Transaction completed</p>
          </div>

          <div className="space-y-2 mb-4">
            {saleItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center mt-4 text-sm text-gray-500">Thank you for your business!</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Entry</h1>
          <p className="text-gray-600">Record new sales transactions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Add Products</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a product...</option>
                  {inventory.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₦{product.price.toLocaleString()} ({product.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addItem}
                disabled={!selectedProduct}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add to Sale
              </button>
            </div>
          </div>

          {/* Sale Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Current Sale</h2>

            {saleItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saleItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ₦{item.price.toLocaleString()} per {item.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded-md hover:bg-gray-200">
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>

                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded-md hover:bg-gray-200">
                        <Plus className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-600">₦{total.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={completeSale}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium transition-colors"
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
