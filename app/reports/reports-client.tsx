"use client"

import { useState } from "react"
import { TrendingUp, Download, DollarSign, PieChart, Plus, Trash2, CheckCircle, AlertCircle, ShoppingBag } from "lucide-react"
import { addExpense, deleteExpense } from "@/app/actions/expenses"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Types
type Expense = {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

type Sale = {
    id: string
    product_name: string
    quantity: number
    total_amount: number
    profit: number
    sold_at: string
}

type ReportData = {
  totalRevenue: number
  totalGrossProfit: number
  totalOperatingExpenses: number
  totalItemsSold: number
  salesByMonth: { month: string; total: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  expensesList: Expense[]
  rawSales: Sale[] // Needed for Export
}

export default function ReportsClient({ data }: { data: ReportData }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- CALCULATIONS ---
  const netProfit = data.totalGrossProfit - data.totalOperatingExpenses
  const profitMargin = data.totalRevenue > 0 ? ((netProfit / data.totalRevenue) * 100).toFixed(1) : "0"
  
  const vatCollected = data.totalRevenue * 0.075 
  const isExempt = data.totalRevenue < 25000000 
  
  // Insights
  const bestProduct = data.topProducts[0]?.name || "None"
  const busiestMonth = data.salesByMonth.reduce((prev, current) => (prev.total > current.total) ? prev : current, { month: '-', total: 0 })

  // Transform Data for Recharts
  const chartData = (() => {
    const activeRange = 6; // Show last 6 months
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const buckets: Record<string, { name: string, revenue: number }> = {};
    const orderedData: { name: string, revenue: number }[] = [];

    // 1. Create empty buckets (forces Zeros for months with no sales)
    for (let i = activeRange - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // e.g., "Aug 2025"
      
      const bucket = { name: label, revenue: 0 };
      buckets[key] = bucket;
      orderedData.push(bucket);
    }

    // 2. Fill the buckets with your actual raw sales data
    if (data.rawSales) {
      data.rawSales.forEach(sale => {
        const d = new Date(sale.sold_at);
        if (isNaN(d.getTime())) return;
        
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (buckets[key]) {
          buckets[key].revenue += Number(sale.total_amount) || 0;
        }
      });
    }

    return orderedData;
  })();

  // --- EXPORT FUNCTION ---
  const handleExport = () => {
    const headers = ["Date", "Time", "Product", "Quantity", "Total Amount (NGN)", "Profit (NGN)"]
    const rows = data.rawSales.map(sale => {
        const d = new Date(sale.sold_at)
        return [
            d.toLocaleDateString(),
            d.toLocaleTimeString(),
            `"${sale.product_name.replace(/"/g, '""')}"`, // Escape quotes
            sale.quantity,
            sale.total_amount,
            sale.profit
        ]
    })

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Odin_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Financial health, tax compliance, and insights (Last 12 Months)</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowExpenseForm(true)}
                className="bg-white border text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-gray-50 font-medium"
            >
                <Plus className="h-4 w-4" /> Record Expense
            </button>
            <button 
                onClick={handleExport}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm hover:bg-blue-700 font-medium active:scale-95 transition-transform"
            >
                <Download className="h-4 w-4" /> Export Report
            </button>
        </div>
      </div>

      {/* 1. FINANCIAL HEALTH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{data.totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg"><DollarSign className="h-5 w-5 text-gray-600"/></div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Gross Profit</p>
                    <h3 className="text-2xl font-bold text-blue-700 mt-1">₦{data.totalGrossProfit.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Sales - Cost of Goods</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg"><PieChart className="h-5 w-5 text-blue-600"/></div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Op. Expenses</p>
                    <h3 className="text-2xl font-bold text-red-700 mt-1">₦{data.totalOperatingExpenses.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Rent, Fuel, Salaries</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg"><TrendingUp className="h-5 w-5 text-red-600"/></div>
            </div>
        </div>

        <div className={`p-5 rounded-xl shadow-sm border ${netProfit >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
             <div className="flex justify-between items-start">
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>Net Profit</p>
                    <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>₦{netProfit.toLocaleString()}</h3>
                    <p className={`text-[10px] mt-1 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{profitMargin}% Net Margin</p>
                </div>
                <div className={`p-2 rounded-lg ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <TrendingUp className={`h-5 w-5 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}/>
                </div>
            </div>
        </div>
      </div>

      {/* 2. CHARTS & PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (RECHARTS) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" /> Revenue Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis 
                tick={{fontSize: 12}} 
                tickLine={false} 
                axisLine={false}
                width={45} /* Gives the axis room to breathe */
                tickFormatter={(value) => {
                // Formats 1,500,000 to "1.5M" and 50,000 to "50K"
                return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
                }}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-gray-500" /> Top Products
          </h3>
          <div className="space-y-5">
            {data.topProducts.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No sales recorded yet.</p>
            ) : (
                data.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-gray-100 text-gray-600' : 
                            index === 2 ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{product.name}</p>
                            <p className="text-[11px] text-gray-500">{product.quantity} sold</p>
                        </div>
                    </div>
                    <p className="font-medium text-gray-700 text-sm">₦{product.revenue.toLocaleString()}</p>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* 3. TAX & EXPENSES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tax Compliance */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
            
            <div className="mb-6 relative z-10">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" /> 
                    Tax & Compliance (FIRS)
                </h3>
                <p className="text-sm text-gray-500 mt-1">Based on 2025 Finance Act Guidelines</p>
            </div>

            <div className={`p-4 rounded-lg flex items-start gap-4 mb-6 ${isExempt ? 'bg-green-50 border border-green-100' : 'bg-yellow-50 border border-yellow-100'}`}>
                {isExempt ? <CheckCircle className="h-6 w-6 text-green-600 shrink-0" /> : <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />}
                <div>
                    <p className={`font-bold ${isExempt ? 'text-green-900' : 'text-yellow-900'}`}>
                        Status: {isExempt ? 'Small Company (Exempt)' : 'Standard Company'}
                    </p>
                    <p className={`text-xs mt-1 ${isExempt ? 'text-green-700' : 'text-yellow-700'}`}>
                        {isExempt 
                            ? 'Turnover < ₦25M. Exempt from Company Income Tax.' 
                            : 'Turnover > ₦25M. Standard CIT applies.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Taxable Income</p>
                    <p className="text-lg font-bold text-gray-900">₦{netProfit.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Net Profit</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                     <p className="text-[10px] text-blue-600 uppercase font-bold">VAT Remittance</p>
                     <p className="text-lg font-bold text-blue-700">₦{vatCollected.toLocaleString()}</p>
                     <p className="text-[10px] text-blue-400">7.5% of Sales</p>
                </div>
            </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Recent Expenses</h3>
            
            <div className="flex-grow overflow-y-auto space-y-3 max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {data.expensesList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="bg-gray-50 p-3 rounded-full mb-3">
                            <Plus className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500">No expenses yet.</p>
                        <button onClick={() => setShowExpenseForm(true)} className="text-blue-600 text-xs font-medium mt-2 hover:underline">Record your first expense</button>
                    </div>
                ) : (
                    data.expensesList.map((exp) => (
                        <div key={exp.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 group transition-all">
                            <div>
                                <p className="font-medium text-gray-800 text-sm">{exp.description}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{new Date(exp.date).toLocaleDateString()} • {exp.category}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-red-600 font-bold text-sm">-₦{exp.amount.toLocaleString()}</span>
                                <button 
                                    onClick={async () => {
                                        if(confirm('Delete this expense?')) await deleteExpense(exp.id)
                                    }}
                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* 4. BUSINESS INSIGHTS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Business Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Peak Performance</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Your best selling product is <span className="font-semibold text-gray-900">{bestProduct}</span>. 
                    {busiestMonth.total > 0 && ` Your highest revenue month was ${busiestMonth.month}.`}
                </p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Financial Health</p>
                <p className="text-sm text-gray-500 leading-relaxed">
                    You are currently operating at a <span className={`font-semibold ${netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>{profitMargin}% net margin</span>. 
                    {data.totalOperatingExpenses > data.totalGrossProfit ? ' Warning: Your expenses are higher than your gross profit.' : ' Keep monitoring your overheads to maintain profitability.'}
                </p>
            </div>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-100">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Record Expense</h2>
                    <button onClick={() => setShowExpenseForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <form action={async (formData) => {
                    setIsSubmitting(true)
                    await addExpense(formData)
                    setIsSubmitting(false)
                    setShowExpenseForm(false)
                }} className="space-y-4">
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                        <input name="description" required placeholder="e.g. Generator Fuel, Shop Rent" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Amount (₦)</label>
                            <input type="number" name="amount" required className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date</label>
                            <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                        <select name="category" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="Utilities">Utilities (Fuel, Light)</option>
                            <option value="Rent">Rent</option>
                            <option value="Salaries">Salaries</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Logistics">Logistics/Transport</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="pt-2">
                        <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                            {isSubmitting ? 'Saving...' : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  )
}