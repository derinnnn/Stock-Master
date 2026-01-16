"use client"

import { useState, useMemo } from "react"
import { Search, FileText, ChevronDown, ChevronUp, Package } from "lucide-react"
import jsPDF from "jspdf"

type SaleItem = {
  id: string
  product_name: string
  quantity: number
  total_amount: number
  sold_at: string
}

type Order = {
  id: string
  date: Date
  totalAmount: number
  totalItems: number
  items: SaleItem[]
}

export default function SalesHistoryClient({ initialSales, business }: { initialSales: SaleItem[], business: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const orders = useMemo(() => {
    const groups: { [key: string]: Order } = {}
    initialSales.forEach(sale => {
      const key = sale.sold_at 
      if (!groups[key]) {
        groups[key] = { id: key, date: new Date(sale.sold_at), totalAmount: 0, totalItems: 0, items: [] }
      }
      groups[key].items.push(sale)
      groups[key].totalAmount += sale.total_amount
      groups[key].totalItems += sale.quantity
    })
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [initialSales])

  const filteredOrders = orders.filter(order => 
    order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const downloadReceipt = (order: Order) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] })
    
    // FIX: Use 'business_name' 
    const businessName = business?.business_name || "ODIN STORE"

    doc.setFontSize(14); doc.setFont("helvetica", "bold")
    doc.text(businessName, 40, 10, { align: "center" })

    doc.setFontSize(8); doc.setFont("helvetica", "normal")
    const address = business?.address || "Lagos, Nigeria"
    const phone = business?.phone || ""
    
    const splitAddress = doc.splitTextToSize(address, 70)
    doc.text(splitAddress, 40, 15, { align: "center" })
    
    let y = 15 + (splitAddress.length * 4)
    if (phone) { doc.text(phone, 40, y, { align: "center" }); y += 5 }

    doc.text(`Date: ${order.date.toLocaleDateString()} ${order.date.toLocaleTimeString()}`, 40, y, { align: "center" })
    y += 4
    doc.text("(Reprint)", 40, y, { align: "center" })
    y += 2
    doc.text("------------------------------------------------", 40, y, { align: "center" })

    let listY = y + 5
    doc.setFontSize(9); doc.setFont("helvetica", "bold")
    doc.text("Item", 5, listY); doc.text("Qty", 45, listY); doc.text("Price", 75, listY, { align: "right" })
    listY += 5

    doc.setFont("helvetica", "normal")
    order.items.forEach((item) => {
        const name = item.product_name.length > 15 ? item.product_name.substring(0, 15) + "..." : item.product_name
        doc.text(name, 5, listY)
        doc.text(item.quantity.toString(), 48, listY, { align: "center" })
        doc.text(item.total_amount.toLocaleString(), 75, listY, { align: "right" })
        listY += 5
    })

    listY += 2
    doc.text("------------------------------------------------", 40, listY, { align: "center" })
    listY += 5
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text("TOTAL PAID:", 5, listY)
    doc.text(`NGN ${order.totalAmount.toLocaleString()}`, 75, listY, { align: "right" })

    doc.save(`Receipt_${order.date.getTime()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <div className="relative w-64">
           <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
           <input className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><Package className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No sales found.</p></div>
        ) : (
           filteredOrders.map(order => (
             <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm">
                <div onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)} className="p-4 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-full border border-gray-200">{expandedOrderId === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</div>
                        <div><p className="font-bold text-gray-900 text-sm">{order.date.toLocaleDateString()} • {order.date.toLocaleTimeString()}</p><p className="text-xs text-gray-500">{order.totalItems} Items</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-bold text-gray-900">₦{order.totalAmount.toLocaleString()}</p>
                        <button onClick={(e) => { e.stopPropagation(); downloadReceipt(order) }} className="hidden sm:flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"><FileText className="h-3 w-3" /> Receipt</button>
                    </div>
                </div>
                {expandedOrderId === order.id && (
                    <div className="p-4 border-t border-gray-200">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50"><tr><th className="px-2 py-2">Item</th><th className="px-2 py-2 text-center">Qty</th><th className="px-2 py-2 text-right">Total</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {order.items.map((item, idx) => (
                                    <tr key={idx}><td className="px-2 py-2 font-medium">{item.product_name}</td><td className="px-2 py-2 text-center text-gray-500">{item.quantity}</td><td className="px-2 py-2 text-right">₦{item.total_amount.toLocaleString()}</td></tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => downloadReceipt(order)} className="mt-4 sm:hidden w-full flex justify-center items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-xl"><FileText className="h-4 w-4" /> Reprint Receipt</button>
                    </div>
                )}
             </div>
           ))
        )}
      </div>
    </div>
  )
}