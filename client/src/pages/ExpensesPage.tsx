"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Plus, Receipt, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE

type User = { id: number; name: string }
type GroupType = { id: number; name: string; users: User[]; total_expenses?: number }
type Expense = {
  id: number
  description: string
  amount: number
  paid_by: number
  split_type: string
  splits: { user_id: number; amount: number; percentage: number }[]
}

export default function ExpensesPage() {
  const [groups, setGroups] = useState<GroupType[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [desc, setDesc] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState<number | null>(null)
  const [splitType, setSplitType] = useState<"equal" | "percentage">("equal")
  const [percentages, setPercentages] = useState<{ [uid: number]: string }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAddedExpense, setLastAddedExpense] = useState<Expense | null>(null)

  const fetchGroups = () => {
    axios.get(`${API_BASE}/groups`).then((res) => setGroups(res.data))
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleGroupClick = (group: GroupType) => {
    setSelectedGroup(group)
    setDesc("")
    setAmount("")
    setPaidBy(group.users[0]?.id || null)
    setSplitType("equal")
    setPercentages({})
    setError(null)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup || !desc.trim() || !amount || !paidBy) return
    setLoading(true)
    setError(null)

    let splits: any[] = []
    if (splitType === "percentage") {
      splits = selectedGroup.users.map((u) => ({
        user_id: u.id,
        amount: (Number(amount) * (Number(percentages[u.id]) || 0)) / 100,
        percentage: Number(percentages[u.id]) || 0,
      }))
    }

    try {
      const response = await axios.post(`${API_BASE}/groups/${selectedGroup.id}/expenses`, {
        description: desc,
        amount: Number(amount),
        paid_by: paidBy,
        split_type: splitType,
        splits: splitType === "equal" ? undefined : splits,
      })

      // Set the last added expense details
      setLastAddedExpense({
        id: response.data.id || Date.now(), // fallback ID
        description: desc,
        amount: Number(amount),
        paid_by: paidBy,
        split_type: splitType,
        splits: splitType === "equal" ? [] : splits,
      })

      toast.success("Expense added successfully!")
      setDesc("")
      setAmount("")
      setPercentages({})
      fetchGroups()
    } catch (err) {
      setError("Failed to add expense")
      toast.error("Failed to add expense")
    } finally {
      setLoading(false)
    }
  }

  const totalPercentage =
    splitType === "percentage"
      ? selectedGroup
        ? selectedGroup.users.reduce((sum, u) => sum + (Number(percentages[u.id]) || 0), 0)
        : 0
      : 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Groups */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Groups</h2>
                <p className="text-slate-600">Select a group</p>
              </div>
            </div>

            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No groups found</p>
              </div>
            ) : (
              <div className="h-[500px] overflow-y-auto">
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedGroup?.id === group.id
                          ? "border-purple-300 bg-purple-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                      onClick={() => handleGroupClick(group)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-slate-900">{group.name}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                          {group.users.length} members
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{group.users.map((u) => u.name).join(", ")}</p>
                      {group.total_expenses !== undefined && (
                        <p className="text-xs text-slate-600 mt-2">Total: ${group.total_expenses.toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Content - Expense Form and List */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedGroup ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-12 text-center">
              <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Group</h3>
              <p className="text-slate-600">Choose a group from the sidebar to add expenses</p>
            </div>
          </div>
        ) : (
          <>
            {/* Add Expense Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Add Expense</h2>
                    <p className="text-slate-600">Record a new expense for {selectedGroup.name}</p>
                  </div>
                </div>

                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="What was this expense for?"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Paid by</label>
                      <select
                        value={paidBy?.toString() || ""}
                        onChange={(e) => setPaidBy(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        required
                      >
                        {selectedGroup.users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Split type</label>
                      <select
                        value={splitType}
                        onChange={(e) => setSplitType(e.target.value as "equal" | "percentage")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="equal">Equal split</option>
                        <option value="percentage">Percentage split</option>
                      </select>
                    </div>
                  </div>

                  {splitType === "percentage" && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-slate-700 mb-3">Percentage Split</label>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedGroup.users.map((u) => (
                          <div key={u.id} className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700 min-w-0 flex-1">{u.name}</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                placeholder="0"
                                value={percentages[u.id] || ""}
                                onChange={(e) => setPercentages((p) => ({ ...p, [u.id]: e.target.value }))}
                                min={0}
                                max={100}
                                className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                              />
                              <span className="text-sm text-slate-600">%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-sm">
                        Total:{" "}
                        <span
                          className={`font-semibold ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}
                        >
                          {totalPercentage}%
                        </span>
                        {totalPercentage !== 100 && <span className="text-red-600 ml-2">Must equal 100%</span>}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !desc.trim() ||
                      !amount ||
                      !paidBy ||
                      (splitType === "percentage" && totalPercentage !== 100)
                    }
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add Expense
                  </button>
                </form>

                {error && (
                  <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="text-red-800">{error}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Last Added Expense Details */}
            {lastAddedExpense && (
              <div className="bg-white rounded-xl shadow-sm border border-green-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Receipt className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Expense Added Successfully</h3>
                      <p className="text-slate-600">Details of your latest expense</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700">Description</p>
                        <p className="text-slate-900">{lastAddedExpense.description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Amount</p>
                        <p className="text-slate-900 font-semibold">${lastAddedExpense.amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Paid by</p>
                        <p className="text-slate-900">
                          {selectedGroup?.users.find((u) => u.id === lastAddedExpense.paid_by)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Split Type</p>
                        <p className="text-slate-900 capitalize">{lastAddedExpense.split_type}</p>
                      </div>
                    </div>

                    {lastAddedExpense.split_type === "percentage" && lastAddedExpense.splits.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">Split Details</p>
                        <div className="grid grid-cols-2 gap-2">
                          {lastAddedExpense.splits.map((split) => (
                            <div key={split.user_id} className="flex justify-between text-sm">
                              <span>{selectedGroup?.users.find((u) => u.id === split.user_id)?.name}</span>
                              <span>
                                {split.percentage}% (${split.amount.toFixed(2)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
