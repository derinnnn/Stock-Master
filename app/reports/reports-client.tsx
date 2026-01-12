"use client"

import { useState } from "react"
import { Calendar, TrendingUp, Download, DollarSign, AlertCircle, CheckCircle, PieChart } from "lucide-react"

type ReportData = {
  totalRevenue: number
  totalGrossProfit: number
  totalItemsSold: number
  averageMonthlyRevenue: number
  salesByMonth: { month: string; total: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
}

export default function ReportsClient({ data }: { data: ReportData }) {
  const [expenses, setExpenses] = useState<string>("0")
  
  // Tax Calculations
  const numericExpenses = Number(expenses) || 0
  
  // REAL FORMULA: Gross Profit (from DB) - Operating Expenses (Rent/Fuel)
  const netProfit = data.totalGrossProfit - numericExpenses
  
  // VAT is on Revenue (7.5%)
  const vatCollected = data.totalRevenue * 0.075 
  
  // CIT (Company Income Tax) - Simple Estimation
  const isExempt = data.totalRevenue < 25000000 
  // If not exempt, CIT is usually 20-30% of NET PROFIT, not Revenue
  const estimatedCIT = isExempt ? 0 : Math.max(0, netProfit * 0.30)

  // NEW: Export Functionality
  const handleExport = () => {
    // 1. Create CSV Content
    let csvContent = "data:text/csv;charset=utf-8," 
    
    // Summary Section
    csvContent += "STOCKKEEPER REPORT SUMMARY\n"
    csvContent += `Generated Date,${new Date().toLocaleDateString()}\n\n`
    
    csvContent += "FINANCIALS\n"
    csvContent += `Total Revenue (Sales),${data.totalRevenue}\n`
    csvContent += `Total Gross Profit,${data.totalGrossProfit}\n`
    csvContent += `Operating Expenses (User Input),${numericExpenses}\n`
    csvContent += `Net Profit (Est.),${netProfit}\n`
    csvContent += `VAT Collected (7.5%),${vatCollected}\n\n`
    
    csvContent += "METRICS\n"
    csvContent += `Total Items Sold,${data.totalItemsSold}\n`
    csvContent += `Avg. Monthly Revenue,${data.averageMonthlyRevenue}\n\n`
    
    // Top Products Section
    csvContent += "TOP SELLING PRODUCTS\n"
    csvContent += "Product Name,Quantity Sold,Revenue Generated\n"
    
    data.topProducts.forEach(product => {
        // Handle commas in product names by wrapping in quotes
        const safeName = `"${product.name.replace(/"/g, '""')}"`
        csvContent += `${safeName},${product.quantity},${product.revenue}\n`
    })

    // 2. Trigger Download
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `stockkeeper_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Profitability & Tax Analysis</p>
        </div>
        <div className="flex gap-2">
            <select className="border rounded-md px-3 py-2 text-sm">
                <option>Last 30 Days</option>
                <option>This Year</option>
            </select>
            
            {/* UPDATED EXPORT BUTTON */}
            <button 
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
                <Download className="h-4 w-4" /> Export Summary
            </button>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue (Sales)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{data.totalRevenue.toLocaleString()}</h3>
              <p className="text-xs text-green-600 mt-1">+0% from last month</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Gross Profit</p>
              {/* This is the key number you wanted */}
              <h3 className="text-2xl font-bold text-blue-700 mt-2">₦{data.totalGrossProfit.toLocaleString()}</h3>
              <p className="text-xs text-blue-600 mt-1">Revenue minus Cost of Goods</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <PieChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">₦{data.averageMonthlyRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- SALES CHART --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-6">Sales Trend</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {data.salesByMonth.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No sales data yet</div>
            ) : (
                data.salesByMonth.map((month, index) => {
                    const max = Math.max(...data.salesByMonth.map(m => m.total))
                    const height = max === 0 ? 0 : (month.total / max) * 100
                    return (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                             <div className="relative w-full bg-blue-100 rounded-t-sm h-full flex items-end overflow-hidden">
                                 <div 
                                    style={{ height: `${height}%` }} 
                                    className="w-full bg-blue-600 transition-all duration-500 group-hover:bg-blue-700"
                                 />
                             </div>
                             <span className="text-xs text-gray-500 font-medium">{month.month}</span>
                        </div>
                    )
                })
            )}
          </div>
        </div>

        {/* --- TOP PRODUCTS --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No products sold yet.</p>
            ) : (
                data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                        </div>
                    </div>
                    <p className="font-medium text-green-600">₦{product.revenue.toLocaleString()}</p>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* --- TAX SECTION --- */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-100">
        <div className="mb-6">
            <h3 className="font-semibold text-gray-800">Tax & Compliance (FIRS)</h3>
            <p className="text-sm text-gray-500">Nigeria Federal Inland Revenue Service Estimates</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Operating Expenses (₦)</label>
                <input 
                    type="number" 
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter expenses (Rent, Fuel, Salaries)"
                />
                <p className="text-xs text-gray-400 mt-1">Deducted from Gross Profit to find Taxable Income</p>
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-3 ${isExempt ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                {isExempt ? <CheckCircle className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                <div>
                    <p className="font-medium">Compliance Status: {isExempt ? 'Small Company (Exempt)' : 'Standard Company'}</p>
                    <p className="text-sm opacity-90">
                        {isExempt 
                            ? 'Turnover < ₦25M/year. 0% Company Income Tax.' 
                            : 'Turnover > ₦25M. Standard CIT applies.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-xs text-gray-500 uppercase">Est. Net Profit (Taxable)</p>
                    {/* This is now ACCURATE: Gross Profit - Expenses */}
                    <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        ₦{netProfit.toLocaleString()}
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                     <p className="text-xs text-blue-600 uppercase">VAT Remittance (7.5% of Sales)</p>
                     <p className="text-xl font-bold text-blue-700">₦{vatCollected.toLocaleString()}</p>
                </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-2 italic">Disclaimer: These are estimates only. Consult a chartered accountant.</p>
        </div>
      </div>
    </div>
  )
}