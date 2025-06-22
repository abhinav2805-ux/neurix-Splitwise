"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Users, DollarSign, Calculator, Plus, UserPlus, AlertCircle } from "lucide-react"
import axios from "axios"

const API_BASE = "http://localhost:8000"

type User = {
  id: number
  name: string
}

type GroupType = {
  id: number
  name: string
  users: User[]
  total_expenses?: number
}

type Balance = {
  user_id: number
  user_name: string
  balance: number
}

type UserBalance = {
  group_id: number
  group_name: string
  balance: number
}

type UserBalancesResponse = {
  user_id: number
  user_name: string
  balances: UserBalance[]
}

type GroupBalancesResponse = {
  group_id: number
  group_name: string
  balances: Balance[]
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<GroupType[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [groupBalances, setGroupBalances] = useState<Balance[]>([])
  const [userBalances, setUserBalances] = useState<UserBalancesResponse | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("groups")

  // Form states
  const [newUserName, setNewUserName] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expensePaidBy, setExpensePaidBy] = useState<number | null>(null)
  const [splitType, setSplitType] = useState<"equal" | "percentage">("equal")

  // Loading and error states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`)
      setUsers(res.data)
    } catch (err) {
      setError("Failed to fetch users")
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/groups`)
      setGroups(res.data)
    } catch (err) {
      setError("Failed to fetch groups")
    }
  }

  const fetchGroupDetails = async (groupId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/groups/${groupId}`)
      setSelectedGroup(res.data)
    } catch (err) {
      setError("Failed to fetch group details")
    }
  }

  const fetchGroupBalances = async (groupId: number) => {
    try {
      const res = await axios.get<GroupBalancesResponse>(`${API_BASE}/groups/${groupId}/balances`)
      setGroupBalances(res.data.balances)
    } catch (err) {
      setError("Failed to fetch group balances")
    }
  }

  const fetchUserBalances = async (userId: number) => {
    try {
      const res = await axios.get<UserBalancesResponse>(`${API_BASE}/users/${userId}/balances`)
      setUserBalances(res.data)
    } catch (err) {
      setError("Failed to fetch user balances")
    }
  }

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/users`, { name: newUserName })
      setNewUserName("")
      await fetchUsers()
      setError(null)
    } catch (err) {
      setError("Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUserIds.length === 0) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/groups`, {
        name: newGroupName,
        user_ids: selectedUserIds,
      })
      setNewGroupName("")
      setSelectedUserIds([])
      await fetchGroups()
      setError(null)
    } catch (err) {
      setError("Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async () => {
    if (!selectedGroup || !expenseDescription.trim() || !expenseAmount || !expensePaidBy) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE}/groups/${selectedGroup.id}/expenses`, {
        description: expenseDescription,
        amount: Number.parseFloat(expenseAmount),
        paid_by: expensePaidBy,
        split_type: splitType,
      })

      setExpenseDescription("")
      setExpenseAmount("")
      setExpensePaidBy(null)
      await fetchGroupBalances(selectedGroup.id)
      await fetchGroupDetails(selectedGroup.id)
      setError(null)
    } catch (err) {
      setError("Failed to add expense")
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId])
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
    }
  }

  const handleGroupSelect = async (group: GroupType) => {
    setSelectedGroup(group)
    await fetchGroupBalances(group.id)
  }

  const handleUserBalanceSelect = async (userId: number) => {
    setSelectedUserId(userId)
    await fetchUserBalances(userId)
  }

  useEffect(() => {
    fetchUsers()
    fetchGroups()
  }, [])

  const TabButton = ({
    id,
    label,
    icon: Icon,
    isActive,
  }: { id: string; label: string; icon: any; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
  )

  const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 pb-4">{children}</div>

  const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>

  const Button = ({
    children,
    onClick,
    disabled = false,
    variant = "primary",
    className = "",
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    variant?: "primary" | "secondary"
    className?: string
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50"
      } disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )

  const Input = ({
    value,
    onChange,
    placeholder,
    type = "text",
    className = "",
  }: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type?: string
    className?: string
  }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )

  const Select = ({
    value,
    onChange,
    children,
    placeholder,
  }: {
    value: string
    onChange: (value: string) => void
    children: React.ReactNode
    placeholder?: string
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  )

  const Checkbox = ({
    checked,
    onChange,
    id,
  }: {
    checked: boolean
    onChange: (checked: boolean) => void
    id: string
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
  )

  const Badge = ({
    children,
    variant = "default",
  }: { children: React.ReactNode; variant?: "default" | "secondary" }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === "secondary" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
      }`}
    >
      {children}
    </span>
  )

  const Alert = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div className="text-red-800">{children}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Splitwise Clone</h1>
          <p className="text-gray-600">Manage shared expenses with friends and family</p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-lg shadow-sm">
            <TabButton id="users" label="Users" icon={Users} isActive={activeTab === "users"} />
            <TabButton id="groups" label="Groups" icon={Plus} isActive={activeTab === "groups"} />
            <TabButton id="expenses" label="Expenses" icon={DollarSign} isActive={activeTab === "expenses"} />
            <TabButton id="balances" label="Balances" icon={Calculator} isActive={activeTab === "balances"} />
          </div>

          {activeTab === "users" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Create New User</h2>
                  </div>
                  <p className="text-gray-600">Add a new user to the system</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                      <Input
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter user name"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateUser} disabled={loading || !newUserName.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">All Users</h2>
                  <p className="text-gray-600">Manage existing users</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{user.name}</span>
                          <Badge variant="secondary">ID: {user.id}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5" />
                    <h2 className="text-xl font-semibold">Create New Group</h2>
                  </div>
                  <p className="text-gray-600">Create a group and add members</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(checked) => handleUserSelection(user.id, checked)}
                            />
                            <label htmlFor={`user-${user.id}`} className="text-sm font-normal cursor-pointer">
                              {user.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateGroup}
                      disabled={loading || !newGroupName.trim() || selectedUserIds.length === 0}
                      className="w-full"
                    >
                      Create Group
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Your Groups</h2>
                  <p className="text-gray-600">Select a group to manage expenses</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedGroup?.id === group.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => handleGroupSelect(group)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{group.name}</h3>
                          <Badge>{group.users.length} members</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Members: {group.users.map((u) => u.name).join(", ")}
                        </div>
                        {group.total_expenses !== undefined && (
                          <div className="text-sm text-gray-500 mt-1">
                            Total expenses: ${group.total_expenses.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-6">
              {selectedGroup ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <h2 className="text-xl font-semibold">Add Expense to {selectedGroup.name}</h2>
                    </div>
                    <p className="text-gray-600">Record a new shared expense</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <Input
                            value={expenseDescription}
                            onChange={(e) => setExpenseDescription(e.target.value)}
                            placeholder="What was this expense for?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                          <Input
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
                          <Select
                            value={expensePaidBy?.toString() || ""}
                            onChange={(value) => setExpensePaidBy(Number.parseInt(value))}
                            placeholder="Who paid?"
                          >
                            {selectedGroup.users.map((user) => (
                              <option key={user.id} value={user.id.toString()}>
                                {user.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Split type</label>
                          <Select value={splitType} onChange={(value: "equal" | "percentage") => setSplitType(value)}>
                            <option value="equal">Equal split</option>
                            <option value="percentage">Percentage split</option>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddExpense}
                        disabled={loading || !expenseDescription.trim() || !expenseAmount || !expensePaidBy}
                        className="w-full"
                      >
                        Add Expense
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <Plus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Group Selected</h3>
                      <p className="text-gray-600">Please select a group from the Groups tab to add expenses.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "balances" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Group Balances</h2>
                  <p className="text-gray-600">
                    {selectedGroup ? `Balances for ${selectedGroup.name}` : "Select a group to view balances"}
                  </p>
                </CardHeader>
                <CardContent>
                  {selectedGroup ? (
                    <div className="space-y-3">
                      {groupBalances.map((balance) => (
                        <div key={balance.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{balance.user_name}</span>
                          <div className="text-right">
                            <div
                              className={`font-semibold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">{balance.balance >= 0 ? "gets back" : "owes"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Select a group to view balances</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Personal Balance Summary</h2>
                  <p className="text-gray-600">Select a user to view their balance across all groups</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select
                      value={selectedUserId?.toString() || ""}
                      onChange={(value) => handleUserBalanceSelect(Number.parseInt(value))}
                      placeholder="Select a user"
                    >
                      {users.map((user) => (
                        <option key={user.id} value={user.id.toString()}>
                          {user.name}
                        </option>
                      ))}
                    </Select>

                    {userBalances && (
                      <div className="space-y-3">
                        <div className="font-semibold text-lg">{userBalances.user_name}</div>
                        <hr className="border-gray-200" />
                        {userBalances.balances.map((balance) => (
                          <div
                            key={balance.group_id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span className="font-medium">{balance.group_name}</span>
                            <div
                              className={`font-semibold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                            </div>
                          </div>
                        ))}
                        {userBalances.balances.length === 0 && (
                          <div className="text-center py-4 text-gray-500">No balances found for this user</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
