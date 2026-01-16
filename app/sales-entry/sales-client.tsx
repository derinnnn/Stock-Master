"use client"

import { useState } from "react"
import { Search, ShoppingCart, Trash2, Plus, Minus, FileText, CheckCircle, Loader2, X } from "lucide-react"
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

export default function SalesEntryClient({ inventory, business }: { inventory: InventoryItem[], business: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [isCartOpen, setIsCartOpen] = useState(false)
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

  const removeFromCart = (id: string) => { setCart(prev => prev.filter(item => item.id !== id)) }

  const adjustQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + delta
            if (newQty < 1 || newQty > item.stock) return item
            return { ...item, quantity: newQty }
        }
        return item
    }))
  }

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

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
        setLastOrderTotal(cartTotal)
        setLastOrderItems(cart)
        setShowSuccess(true)
        setCart([])
        setIsCartOpen(false)
    } else {
        alert("Checkout Failed: " + result.error)
    }
  }

  const downloadReceipt = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] })
    
    // FIX: Use 'business_name' instead of 'name'
    const businessName = business?.business_name || "ODIN STORE" 
    
    doc.setFontSize(14); doc.setFont("helvetica", "bold")
    doc.text(businessName, 40, 10, { align: "center" })
    
    doc.setFontSize(8); doc.setFont("helvetica", "normal")
    const address = business?.address || "Lagos, Nigeria"
    const phone = business?.phone || ""
    
    const splitAddress = doc.splitTextToSize(address, 70)
    doc.text(splitAddress, 40, 15, { align: "center" })
    
    let y = 15 + (splitAddress.length * 4)
    if (phone) {
        doc.text(phone, 40, y, { align: "center" })
        y += 5
    }

    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, y, { align: "center" })
    y += 5
    doc.text("------------------------------------------------", 40, y, { align: "center" })

    y += 5
    doc.setFontSize(9); doc.setFont("helvetica", "bold")
    doc.text("Item", 5, y); doc.text("Qty", 45, y); doc.text("Price", 75, y, { align: "right" })
    y += 5

    doc.setFont("helvetica", "normal")
    lastOrderItems.forEach((item) => {
        const name = item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name
        doc.text(name, 5, y)
        doc.text(item.quantity.toString(), 48, y, { align: "center" })
        doc.text((item.price * item.quantity).toLocaleString(), 75, y, { align: "right" })
        y += 5
    })

    y += 2
    doc.text("------------------------------------------------", 40, y, { align: "center" })
    y += 5
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text("TOTAL PAID:", 5, y)
    doc.text(`NGN ${lastOrderTotal.toLocaleString()}`, 75, y, { align: "right" })

    y += 15
    doc.setFontSize(8); doc.setFont("helvetica", "italic")
    doc.text("Thank you for your patronage!", 40, y, { align: "center" })
    
    doc.save(`Receipt_${Date.now()}.pdf`)
  }

  return (
    <div className="h-[calc(100vh-100px)] relative md:flex md:gap-6">
      <div className={`flex-1 flex flex-col overflow-hidden transition-all ${isCartOpen ? 'hidden md:flex' : 'flex'}`}>
        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pr-2 pb-24 md:pb-20">
            {filteredProducts.map(product => (
                <button key={product.id} onClick={() => addToCart(product)} disabled={product.stock <= 0} className="flex flex-col items-start p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left">
                    <div className="w-full flex justify-between items-start mb-2">
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full font-bold uppercase">{product.category || 'General'}</span>
                        <span className={`text-[10px] font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{product.stock} Left</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                    <p className="mt-2 text-base font-bold text-blue-600">₦{(product.price || 0).toLocaleString()}</p>
                </button>
            ))}
        </div>
      </div>

      {!isCartOpen && cart.length > 0 && (
          <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-5">
              <button onClick={() => setIsCartOpen(true)} className="w-full bg-gray-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold">{totalItems}</div>
                      <span className="font-medium text-sm">View Current Order</span>
                  </div>
                  <span className="font-bold text-lg">₦{cartTotal.toLocaleString()}</span>
              </button>
          </div>
      )}

      <div className={`bg-white border-l border-gray-200 flex flex-col shadow-xl md:rounded-xl overflow-hidden md:w-96 md:h-full md:relative ${isCartOpen ? 'fixed inset-0 z-50' : 'hidden md:flex'}`}>
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Current Order</h2>
            <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">{cart.length} Items</span>
                <button onClick={() => setIsCartOpen(false)} className="md:hidden p-1 bg-white rounded-full border shadow-sm"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <div className="flex-1"><p className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</p><p className="text-xs text-gray-500">₦{(item.price || 0).toLocaleString()} x {item.quantity}</p></div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-white border rounded-lg p-1 shadow-sm">
                            <button onClick={() => adjustQuantity(item.id, -1)} className="p-1 hover:bg-gray-100"><Minus className="h-3 w-3" /></button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => adjustQuantity(item.id, 1)} className="p-1 hover:bg-gray-100"><Plus className="h-3 w-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50 pb-8 md:pb-4">
            <div className="flex justify-between items-center mb-4"><span className="text-gray-600">Total Amount</span><span className="text-2xl font-bold text-gray-900">₦{cartTotal.toLocaleString()}</span></div>
            <button onClick={handleCheckout} disabled={cart.length === 0 || isCheckingOut} className="w-full bg-blue-600 text-white py-4 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                {isCheckingOut ? "Processing..." : "Complete Sale"}
            </button>
        </div>
      </div>
      
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sale Completed!</h3>
                <button onClick={downloadReceipt} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-2"><FileText className="h-4 w-4" /> Download Receipt</button>
                <button onClick={() => setShowSuccess(false)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold">Start New Sale</button>
            </div>
        </div>
      )}
    </div>
  )
}