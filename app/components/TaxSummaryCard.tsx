"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, DollarSign } from "lucide-react"

interface TaxSummaryCardProps {
  totalRevenue: number
}

export default function TaxSummaryCard({ totalRevenue }: TaxSummaryCardProps) {
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  // Calculate annual figures
  const annualRevenue = totalRevenue * 12
  const annualExpenses = monthlyExpenses * 12
  const netProfit = totalRevenue - monthlyExpenses

  // FIRS Tax Calculations for Nigeria
  const isSmallCompany = annualRevenue < 100000000 // < ₦100M
  const citRate = isSmallCompany ? 0 : 0.3 // 0% for small companies, 30% for others
  const citAmount = netProfit * citRate
  const vatRate = 0.075 // 7.5% VAT
  const vatCollected = totalRevenue * vatRate

  const complianceStatus = isSmallCompany ? "Good" : "Liable"
  const complianceColor = isSmallCompany ? "green" : "yellow"

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Tax & Compliance (FIRS)</h2>
        <p className="text-sm text-gray-600">Nigeria Federal Inland Revenue Service Guidelines</p>
      </div>

      {/* Monthly Expenses Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Operating Expenses (₦)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600">₦</span>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter monthly expenses"
            min="0"
          />
        </div>
      </div>

      {/* Compliance Status Badge */}
      <div
        className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${complianceColor === "green" ? "bg-green-50" : "bg-amber-50"}`}
      >
        {complianceColor === "green" ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        )}
        <div>
          <p className={`font-semibold ${complianceColor === "green" ? "text-green-900" : "text-amber-900"}`}>
            Compliance Status: {complianceStatus}
          </p>
          {isSmallCompany ? (
            <p className="text-sm text-green-700">
              Your business qualifies for Small Company Status (Turnover &lt; ₦100M)
            </p>
          ) : (
            <p className="text-sm text-amber-700">
              Your business exceeds ₦100M turnover threshold and is liable for CIT
            </p>
          )}
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue (Average)</p>
              <p className="font-medium text-gray-900">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Monthly Net Profit</p>
              <p className="font-medium text-gray-900">₦{netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">VAT Collected (7.5%)</p>
              <p className="font-semibold text-blue-900">₦{vatCollected.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">Remittable to FIRS monthly</p>
            </div>
          </div>
        </div>

        {!isSmallCompany && (
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-amber-700">Est. Annual CIT (30%)</p>
                <p className="font-semibold text-amber-900">₦{(citAmount * 12).toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">Annual liability estimate</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        {showDetails ? "Hide" : "Show"} tax calculation details
      </button>

      {showDetails && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
          <div>
            <p className="text-sm text-gray-600">Annual Turnover (Projected):</p>
            <p className="font-medium text-gray-900">₦{annualRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Annual Net Profit:</p>
            <p className="font-medium text-gray-900">₦{(netProfit * 12).toLocaleString()}</p>
          </div>
          {!isSmallCompany && (
            <div>
              <p className="text-sm text-gray-600">CIT Calculation:</p>
              <p className="text-sm text-gray-700">
                Net Profit × 30% = ₦{(netProfit * 12).toLocaleString()} × 30% = ₦{citAmount.toLocaleString()} annually
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">VAT Calculation:</p>
            <p className="text-sm text-gray-700">
              Monthly Revenue × 7.5% = ₦{totalRevenue.toLocaleString()} × 7.5% = ₦{vatCollected.toLocaleString()}{" "}
              monthly
            </p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs text-blue-800">
          <strong>Disclaimer:</strong> These estimates are based on the Nigeria Tax Act 2025 and FIRS guidelines. They
          are provided for informational purposes only. Please consult with a qualified chartered accountant before
          filing your taxes with FIRS. Tax laws may change, and individual circumstances vary.
        </p>
      </div>
    </div>
  )
}
