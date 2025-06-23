"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Calculator, TrendingUp, TrendingDown, Users, Receipt, ToggleLeft, ToggleRight } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_BASE

type GroupType = { id: number; name: string; users: { id: number; name: string }[]; total_expenses?: number }
type Balance = { user_id: number; user_name: string; balance: number }
type UserBalance = { group_id: number; group_name: string; balance: number }
type UserBalancesResponse = { user_id: number; user_name: string; balances: UserBalance[] }
type GroupBalancesResponse = { group_id: number; group_name: string; balances: Balance[] }
type Settlement = {
  from_user_id: number
  from_user_name: string
  to_user_id: number
  to_user_name: string
  amount: number
}
type Expense = {
  id: number
  description: string
  amount: number
  paid_by: number
  split_type: string
  splits: { user_id: number; amount: number; percentage: number }[]
}

export default function BalancesPage() {
  const [groups, setGroups] = useState<GroupType[]>([])
  const [users, setUsers] = useState<{ id: number; name: string }[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [groupBalances, setGroupBalances] = useState<Balance[]>([])
  const [groupExpenses, setGroupExpenses] = useState<Expense[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userBalances, setUserBalances] = useState<UserBalancesResponse | null>(null)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [settleLoading, setSettleLoading] = useState(false)
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [personalToggle, setPersonalToggle] = useState<"groups" | "users">("groups")

  useEffect(() => {
    axios.get(`${API_BASE}/groups`).then((res) => setGroups(res.data))
    axios.get(`${API_BASE}/users`).then((res) => setUsers(res.data))
  }, [])

  const handleGroupClick = async (group: GroupType) => {
    setSelectedGroup(group)

    // Fetch balances
    const balanceRes = await axios.get<GroupBalancesResponse>(`${API_BASE}/groups/${group.id}/balances`)
    setGroupBalances(balanceRes.data.balances)

    // Fetch expenses
    setExpensesLoading(true)
    try {
      const expenseRes = await axios.get(`${API_BASE}/groups/${group.id}/expenses`)
      setGroupExpenses(expenseRes.data)
    } finally {
      setExpensesLoading(false)
    }

    // Fetch settlements
    setSettleLoading(true)
    try {
      const settleRes = await axios.get<{ settlements: Settlement[] }>(`${API_BASE}/groups/${group.id}/settle`)
      setSettlements(settleRes.data.settlements)
    } finally {
      setSettleLoading(false)
    }
  }

  const handleUserSelect = async (userId: number) => {
    setSelectedUserId(userId)
    const res = await axios.get<UserBalancesResponse>(`${API_BASE}/users/${userId}/balances`)
    setUserBalances(res.data)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Groups */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
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
              <div className="h-96 overflow-y-auto">
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedGroup?.id === group.id
                          ? "border-blue-300 bg-blue-50 shadow-sm"
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

      {/* Right Content - Group Details */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedGroup ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-12 text-center">
              <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Group</h3>
              <p className="text-slate-600">Choose a group from the sidebar to view balances and expenses</p>
            </div>
          </div>
        ) : (
          <>
            {/* Group Balances */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calculator className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Balances</h3>
                    <p className="text-slate-600">{selectedGroup.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {groupBalances.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-slate-600 font-medium text-sm">
                            {balance.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-900">{balance.user_name}</span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold flex items-center gap-1 ${
                            balance.balance >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {balance.balance >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500">{balance.balance >= 0 ? "gets back" : "owes"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Group Expenses */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Expenses</h3>
                    <p className="text-slate-600">{selectedGroup.name}</p>
                  </div>
                </div>

                {expensesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600">Loading expenses...</span>
                  </div>
                ) : groupExpenses.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">No expenses found for this group</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {groupExpenses.map((expense) => (
                      <div key={expense.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{expense.description}</h4>
                          <span className="font-semibold text-green-600">${expense.amount.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <p>Paid by: {selectedGroup.users.find((u) => u.id === expense.paid_by)?.name}</p>
                          <p>Split: {expense.split_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Settlements */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calculator className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Settlements</h3>
                    <p className="text-slate-600">Suggested payments</p>
                  </div>
                </div>

                {settleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-slate-600">Calculating...</span>
                  </div>
                ) : settlements.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">All settled up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settlements.map((settlement, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-600 font-medium text-sm">
                                {settlement.from_user_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm">
                              <span className="font-medium text-slate-900">{settlement.from_user_name}</span>
                              <span className="text-slate-600"> pays </span>
                              <span className="font-medium text-slate-900">{settlement.to_user_name}</span>
                            </span>
                          </div>
                          <span className="font-semibold text-green-600">${settlement.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Personal Balance Summary - Full Width */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Personal Balance Summary</h2>
                  <p className="text-slate-600">View individual balance across all groups</p>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${personalToggle === "groups" ? "text-orange-600" : "text-slate-500"}`}
                >
                  Groups
                </span>
                <button
                  onClick={() => setPersonalToggle(personalToggle === "groups" ? "users" : "groups")}
                  className="p-1"
                >
                  {personalToggle === "groups" ? (
                    <ToggleLeft className="w-8 h-8 text-orange-600" />
                  ) : (
                    <ToggleRight className="w-8 h-8 text-orange-600" />
                  )}
                </button>
                <span
                  className={`text-sm font-medium ${personalToggle === "users" ? "text-orange-600" : "text-slate-500"}`}
                >
                  Users
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left - List */}
              <div className="lg:col-span-1">
                <div className="h-80 overflow-y-auto border border-slate-200 rounded-lg p-4">
                  {personalToggle === "groups" ? (
                    <div className="space-y-2">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className="p-3 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleGroupClick(group)}
                        >
                          <h4 className="font-medium text-slate-900">{group.name}</h4>
                          <p className="text-xs text-slate-500">{group.users.length} members</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedUserId === user.id
                              ? "border-orange-300 bg-orange-50"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-slate-900">{user.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Details */}
              <div className="lg:col-span-2">
                {personalToggle === "users" && userBalances ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-medium">
                          {userBalances.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{userBalances.user_name}</h3>
                    </div>

                    {userBalances.balances.length === 0 ? (
                      <div className="text-center py-8">
                        <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500">No balances found for this user</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userBalances.balances.map((balance) => (
                          <div key={balance.group_id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-900">{balance.group_name}</span>
                              <div
                                className={`font-semibold flex items-center gap-1 ${
                                  balance.balance >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {balance.balance >= 0 ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                                {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">
                        {personalToggle === "groups"
                          ? "Select a group from the list to view details"
                          : "Select a user from the list to view their balance details"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
