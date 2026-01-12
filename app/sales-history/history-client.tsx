"use client"

import { useState } from "react"
import { Search, Calendar } from "lucide-react"

type Sale = {
  id: string
  product_name: string
  quantity: number
  total_amount: number
  profit: number
  sold_at: string
}

export default function SalesHistoryClient({ initialSales }: { initialSales: Sale[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSales = initialSales.filter(sale => 
    sale.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
           <p className="text-gray-600">Archive of all transactions</p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
            Total Transactions: {initialSales.length}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sale.sold_at).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(sale.sold_at).toLocaleTimeString()}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{sale.product_name}</td>
                <td className="px-6 py-4 text-gray-600">{sale.quantity}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">₦{sale.total_amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-green-600">+₦{sale.profit?.toLocaleString() || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSales.length === 0 && <div className="p-8 text-center text-gray-500">No records found.</div>}
      </div>
    </div>
  )
}