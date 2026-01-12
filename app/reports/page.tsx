"use client"

import { useState } from "react"
import AppLayout from "../components/AppLayout"
import TaxSummaryCard from "../components/TaxSummaryCard"
import { Calendar, TrendingUp, Download } from "lucide-react"

// Mock data for charts
const salesData = [
  { period: "Jan", sales: 45000, items: 120 },
  { period: "Feb", sales: 52000, items: 140 },
  { period: "Mar", sales: 48000, items: 130 },
  { period: "Apr", sales: 61000, items: 165 },
  { period: "May", sales: 55000, items: 150 },
  { period: "Jun", sales: 67000, items: 180 },
]

const topProducts = [
  { name: "Rice (50kg)", sales: 45, revenue: 1012500 },
  { name: "Cooking Oil (5L)", sales: 38, revenue: 95000 },
  { name: "Sugar (1kg)", sales: 67, revenue: 53600 },
  { name: "Bread", sales: 89, revenue: 44500 },
  { name: "Milk (1L)", sales: 56, revenue: 25200 },
]

export default function Reports() {
  const [timeframe, setTimeframe] = useState("30")

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0)
  const totalItems = salesData.reduce((sum, item) => sum + item.items, 0)
  const avgSales = Math.round(totalSales / salesData.length)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600">Business insights and analytics</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₦{totalSales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Monthly</p>
                <p className="text-2xl font-bold text-gray-900">₦{avgSales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {salesData.map((item, index) => {
                const height = (item.sales / Math.max(...salesData.map((d) => d.sales))) * 100
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: "200px" }}>
                      <div
                        className="bg-blue-600 rounded-t absolute bottom-0 w-full transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{item.period}</p>
                    <p className="text-xs font-medium">₦{(item.sales / 1000).toFixed(0)}k</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="font-semibold text-green-600">₦{product.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <TaxSummaryCard totalRevenue={avgSales} />

        {/* Additional Insights */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Business Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Peak Sales Period</h3>
              <p className="text-sm text-gray-600">
                Your highest sales typically occur in the afternoon between 2 PM - 5 PM. Consider stocking up during
                these hours.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Inventory Recommendation</h3>
              <p className="text-sm text-gray-600">
                Based on current trends, consider increasing stock for Rice and Cooking Oil as they show consistent high
                demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
