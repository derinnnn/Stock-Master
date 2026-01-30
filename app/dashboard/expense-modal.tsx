"use client"
import { useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"
import { recordExpense } from "@/app/actions/expenses"

export default function ExpenseButton() {
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)

    return (
        <>
            <button 
                onClick={() => setShow(true)} 
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Record Expense
            </button>

            {show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Record Expense</h3>
                            <button onClick={() => setShow(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <form action={async (formData) => {
                            setLoading(true)
                            const res = await recordExpense(formData)
                            setLoading(false)
                            if(res.success) { 
                                setShow(false); 
                                // Optional: You can add a toast notification here
                            } else { 
                                alert("Error: " + res.error); 
                            }
                        }} className="space-y-4">
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <input name="description" required placeholder="e.g. Generator Fuel" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₦)</label>
                                <input name="amount" type="number" required placeholder="0.00" className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select name="category" className="w-full border p-2.5 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-red-500">
                                    <option value="Utilities">Utilities (Light/Water)</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Restock">Restock / Inventory</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <button 
                                disabled={loading} 
                                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Expense"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}