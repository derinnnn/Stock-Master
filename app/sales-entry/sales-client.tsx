"use client"

import { useState } from "react"
import { Search, ShoppingCart, Trash2, Plus, Minus, FileText, CheckCircle, Loader2 } from "lucide-react"
import { processCheckout } from "@/app/actions/pos"
import jsPDF from "jspdf"

type InventoryItem = {
  id: string
  name: string
  price: number
  cost_price: number
  stock: number
  category: string
}

type CartItem = InventoryItem & { quantity: number }

export default function SalesEntryClient({ inventory }: { inventory: InventoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // New State to remember the last sale for the Receipt
  const [lastOrderTotal, setLastOrderTotal] = useState(0)
  const [lastOrderItems, setLastOrderItems] = useState<CartItem[]>([])

  const filteredProducts = inventory.filter(item => 
    (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return prev 
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const adjustQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + delta
            if (newQty < 1) return item
            if (newQty > item.stock) return item
            return { ...item, quantity: newQty }
        }
        return item
    }))
  }

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setIsCheckingOut(true)

    const result = await processCheckout(cart.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price || 0,
        cost: i.cost_price || 0
    })))

    setIsCheckingOut(false)

    if (result.success) {
        // Save details for the receipt BEFORE clearing the cart
        setLastOrderTotal(cartTotal)
        setLastOrderItems(cart) 
        
        setShowSuccess(true)
        setCart([])
    } else {
        alert("Checkout Failed: " + result.error)
    }
  }

  const downloadReceipt = () => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200] // Thermal printer width (approx 80mm)
    })
    
    // 1. Header
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("SALES RECEIPT", 40, 10, { align: "center" })//OZEBA JOR
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Lagos, Nigeria", 40, 15, { align: "center" })
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, 20, { align: "center" })

    // 2. Divider
    doc.text("------------------------------------------------", 40, 25, { align: "center" })

    // 3. Items Header
    let y = 30
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Item", 5, y)
    doc.text("Qty", 45, y)
    doc.text("Price", 75, y, { align: "right" })
    y += 5

    // 4. Items List (Loop through lastOrderItems)
    doc.setFont("helvetica", "normal")
    lastOrderItems.forEach((item) => {
        // Truncate long names
        const name = item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name
        
        doc.text(name, 5, y)
        doc.text(item.quantity.toString(), 48, y, { align: "center" })
        doc.text((item.price * item.quantity).toLocaleString(), 75, y, { align: "right" })
        y += 5
    })

    // 5. Totals
    y += 2
    doc.text("------------------------------------------------", 40, y, { align: "center" })
    y += 5
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("TOTAL PAID:", 5, y)
    doc.text(`NGN ${lastOrderTotal.toLocaleString()}`, 75, y, { align: "right" })

    // 6. Footer
    y += 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your patronage!", 40, y, { align: "center" })
    doc.text("Powered by Odin", 40, y + 5, { align: "center" })

    doc.save(`Receipt_${Date.now()}.pdf`)
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT: PRODUCT GRID */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-20">
            {filteredProducts.map(product => (
                <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                    <div className="w-full flex justify-between items-start mb-2">
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wide">{product.category || 'General'}</span>
                        <span className={`text-[10px] font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{product.stock} Left</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    <p className="mt-2 text-lg font-bold text-blue-600">₦{(product.price || 0).toLocaleString()}</p>
                </button>
            ))}
        </div>
      </div>

      {/* RIGHT: CART SIDEBAR */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl md:rounded-xl overflow-hidden h-full">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" /> Current Order
            </h2>
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">{cart.length} Items</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center opacity-60">
                    <ShoppingCart className="h-12 w-12 mb-2" />
                    <p>Cart is empty</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">₦{(item.price || 0).toLocaleString()} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => adjustQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus className="h-3 w-3" /></button>
                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => adjustQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus className="h-3 w-3" /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span>
            </div>
            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckingOut}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
                {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                {isCheckingOut ? "Processing..." : "Complete Sale"}
            </button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sale Completed!</h3>
                <p className="text-gray-500 mb-6">Revenue has been recorded and inventory updated.</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={downloadReceipt}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800"
                    >
                        <FileText className="h-4 w-4" /> Download Receipt
                    </button>
                    <button 
                        onClick={() => setShowSuccess(false)}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200"
                    >
                        Start New Sale
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}