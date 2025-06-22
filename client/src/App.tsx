"use client"

import type React from "react"

import { useEffect, useState } from "react"
import axios from "axios"
import { Users, DollarSign, Calculator, Plus, UserPlus, AlertCircle } from "lucide-react"

// Base URL for the API. In a real application, this would be configured more robustly (e.g., environment variables).
const API_BASE = "http://localhost:8000"

// Type definitions for data structures used in the application.
type User = {
  id: number
  name: string
}

type GroupType = {
  id: number
  name: string
  users: User[]
  total_expenses?: number // Optional, as it might not be present on initial group fetch
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

// Reusable UI Components (moved outside App to prevent re-definition on every render)

/**
 * Renders a tab button for navigation.
 * @param {string} id - Unique identifier for the tab.
 * @param {string} label - Text label for the button.
 * @param {any} icon - Lucide React icon component.
 * @param {boolean} isActive - True if the tab is currently active.
 * @param {() => void} onClick - Function to call when the button is clicked.
 */
const TabButton = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  id: string
  label: string
  icon: any
  isActive: boolean
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
)

/**
 * A generic card container with basic styling.
 * @param {React.ReactNode} children - Content to display inside the card.
 * @param {string} className - Additional CSS classes.
 */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
)

/**
 * Header section for a card.
 * @param {React.ReactNode} children - Content for the header.
 */
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="p-6 pb-4">{children}</div>

/**
 * Content section for a card.
 * @param {React.ReactNode} children - Content for the body of the card.
 */
const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>

/**
 * A styled button component.
 * @param {React.ReactNode} children - Content of the button (e.g., text, icon).
 * @param {() => void} onClick - Function to call when the button is clicked.
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {"primary" | "secondary"} variant - Visual style of the button.
 * @param {string} className - Additional CSS classes.
 */
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

/**
 * A styled input field.
 * @param {string} value - Current value of the input.
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} onChange - Handler for input changes.
 * @param {string} placeholder - Placeholder text.
 * @param {string} type - Input type (e.g., "text", "number").
 * @param {string} className - Additional CSS classes.
 */
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

/**
 * A styled select dropdown.
 * @param {string} value - Current selected value.
 * @param {(value: string) => void} onChange - Handler for select changes.
 * @param {React.ReactNode} children - Option elements.
 * @param {string} placeholder - Placeholder text for the first option.
 */
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

/**
 * A styled checkbox input.
 * @param {boolean} checked - Whether the checkbox is checked.
 * @param {(checked: boolean) => void} onChange - Handler for checkbox changes.
 * @param {string} id - Unique ID for the checkbox and its label.
 */
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

/**
 * A small, colored badge component.
 * @param {React.ReactNode} children - Content of the badge.
 * @param {"default" | "secondary"} variant - Visual style of the badge.
 */
const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary"
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      variant === "secondary" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"
    }`}
  >
    {children}
  </span>
)

/**
 * An alert message component for displaying errors or warnings.
 * @param {React.ReactNode} children - Content of the alert message.
 */
const Alert = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
    <div className="text-red-800">{children}</div>
  </div>
)

// Main Application Component
function App() {
  // State variables for managing application data
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<GroupType[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [groupBalances, setGroupBalances] = useState<Balance[]>([])
  const [userBalances, setUserBalances] = useState<UserBalancesResponse | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("groups") // Default active tab

  // State variables for form inputs
  const [newUserName, setNewUserName] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]) // For group creation member selection
  const [expenseDescription, setExpenseDescription] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [expensePaidBy, setExpensePaidBy] = useState<number | null>(null)
  const [splitType, setSplitType] = useState<"equal" | "percentage">("equal") // Expense split type

  // State variables for loading and error handling
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches all users from the backend API.
   * Updates the `users` state or sets an error.
   */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`)
      setUsers(res.data)
      setError(null) // Clear any previous errors on successful fetch
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to fetch users. Please ensure the backend is running.")
    }
  }

  /**
   * Fetches all groups from the backend API.
   * Updates the `groups` state or sets an error.
   */
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/groups`)
      setGroups(res.data)
      setError(null) // Clear any previous errors on successful fetch
    } catch (err) {
      console.error("Error fetching groups:", err)
      setError("Failed to fetch groups. Please ensure the backend is running.")
    }
  }

  /**
   * Fetches details for a specific group.
   * Updates `selectedGroup` state or sets an error.
   * @param {number} groupId - The ID of the group to fetch.
   */
  const fetchGroupDetails = async (groupId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/groups/${groupId}`)
      setSelectedGroup(res.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching group details:", err)
      setError("Failed to fetch group details.")
    }
  }

  /**
   * Fetches balance information for a specific group.
   * Updates `groupBalances` state or sets an error.
   * @param {number} groupId - The ID of the group for which to fetch balances.
   */
  const fetchGroupBalances = async (groupId: number) => {
    try {
      const res = await axios.get<GroupBalancesResponse>(`${API_BASE}/groups/${groupId}/balances`)
      setGroupBalances(res.data.balances)
      setError(null)
    } catch (err) {
      console.error("Error fetching group balances:", err)
      setError("Failed to fetch group balances.")
    }
  }

  /**
   * Fetches balance information for a specific user across all their groups.
   * Updates `userBalances` state or sets an error.
   * @param {number} userId - The ID of the user for whom to fetch balances.
   */
  const fetchUserBalances = async (userId: number) => {
    try {
      const res = await axios.get<UserBalancesResponse>(`${API_BASE}/users/${userId}/balances`)
      setUserBalances(res.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching user balances:", err)
      setError("Failed to fetch user balances.")
    }
  }

  /**
   * Handles the creation of a new user.
   * Sends a POST request to the API and re-fetches the user list.
   */
  const handleCreateUser = async () => {
    if (!newUserName.trim()) {
      setError("User name cannot be empty.")
      return
    }

    setLoading(true)
    setError(null) // Clear previous errors
    try {
      await axios.post(`${API_BASE}/users`, { name: newUserName })
      setNewUserName("") // Clear the input field
      await fetchUsers() // Refresh the user list
    } catch (err) {
      console.error("Error creating user:", err)
      setError("Failed to create user. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles the creation of a new group.
   * Sends a POST request to the API and re-fetches the group list.
   */
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Group name cannot be empty.")
      return
    }
    if (selectedUserIds.length === 0) {
      setError("Please select at least one member for the group.")
      return
    }

    setLoading(true)
    setError(null) // Clear previous errors
    try {
      await axios.post(`${API_BASE}/groups`, {
        name: newGroupName,
        user_ids: selectedUserIds,
      })
      setNewGroupName("") // Clear group name input
      setSelectedUserIds([]) // Clear selected members
      await fetchGroups() // Refresh the group list
    } catch (err) {
      console.error("Error creating group:", err)
      setError("Failed to create group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles adding a new expense to the currently selected group.
   * Sends a POST request to the API and refreshes group balances and details.
   */
  const handleAddExpense = async () => {
    if (!selectedGroup) {
      setError("No group selected. Please select a group first.")
      return
    }
    if (!expenseDescription.trim()) {
      setError("Expense description cannot be empty.")
      return
    }
    const amount = Number.parseFloat(expenseAmount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid expense amount.")
      return
    }
    if (expensePaidBy === null) {
      setError("Please select who paid for the expense.")
      return
    }

    setLoading(true)
    setError(null) // Clear previous errors
    try {
      await axios.post(`${API_BASE}/groups/${selectedGroup.id}/expenses`, {
        description: expenseDescription,
        amount: amount,
        paid_by: expensePaidBy,
        split_type: splitType,
      })

      // Clear expense form fields
      setExpenseDescription("")
      setExpenseAmount("")
      setExpensePaidBy(null)

      // Refresh data after adding expense
      await fetchGroupBalances(selectedGroup.id)
      await fetchGroupDetails(selectedGroup.id)
    } catch (err) {
      console.error("Error adding expense:", err)
      setError("Failed to add expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles selection/deselection of users for group creation.
   * @param {number} userId - The ID of the user being toggled.
   * @param {boolean} checked - True if the user is selected, false otherwise.
   */
  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, userId])
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId))
    }
  }

  /**
   * Handles the selection of a group from the list.
   * Fetches group balances after selection.
   * @param {GroupType} group - The selected group object.
   */
  const handleGroupSelect = async (group: GroupType) => {
    setSelectedGroup(group)
    await fetchGroupBalances(group.id)
  }

  /**
   * Handles the selection of a user for viewing personal balances.
   * Fetches user balances after selection.
   * @param {number} userId - The ID of the selected user.
   */
  const handleUserBalanceSelect = async (userId: number) => {
    setSelectedUserId(userId)
    await fetchUserBalances(userId)
  }

  // useEffect hook to fetch initial data on component mount
  useEffect(() => {
    fetchUsers()
    fetchGroups()
  }, []) // Empty dependency array ensures this runs only once on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Splitwise Clone</h1>
          <p className="text-gray-600">Manage shared expenses with friends and family</p>
        </div>

        {/* Display error messages if any */}
        {error && (
          <div className="mb-6">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="space-y-6">
          {/* Tab navigation for different sections of the app */}
          <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-lg shadow-sm">
            <TabButton id="users" label="Users" icon={Users} isActive={activeTab === "users"} onClick={() => setActiveTab("users")} />
            <TabButton id="groups" label="Groups" icon={Plus} isActive={activeTab === "groups"} onClick={() => setActiveTab("groups")} />
            <TabButton id="expenses" label="Expenses" icon={DollarSign} isActive={activeTab === "expenses"} onClick={() => setActiveTab("expenses")} />
            <TabButton id="balances" label="Balances" icon={Calculator} isActive={activeTab === "balances"} onClick={() => setActiveTab("balances")} />
          </div>

          {/* Users Tab Content */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Create New User Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Create New User</h2>
                  </div>
                  <p className="text-gray-600">Add a new user to the system</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label htmlFor="new-user-name" className="block text-sm font-medium text-gray-700 mb-1">
                        User Name
                      </label>
                      <Input
                        id="new-user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter user name"
                      />
                    </div>
                    <div className="sm:flex sm:items-end">
                      <Button onClick={handleCreateUser} disabled={loading || !newUserName.trim()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Users List Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">All Users</h2>
                  <p className="text-gray-600">Manage existing users</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.length === 0 ? (
                      <p className="text-gray-500 col-span-full text-center">No users found. Create one above!</p>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{user.name}</span>
                            <Badge variant="secondary">ID: {user.id}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Groups Tab Content */}
          {activeTab === "groups" && (
            <div className="space-y-6">
              {/* Create New Group Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold">Create New Group</h2>
                  </div>
                  <p className="text-gray-600">Create a group and add members</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="new-group-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name
                      </label>
                      <Input
                        id="new-group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {users.length === 0 ? (
                          <p className="text-gray-500 col-span-full">No users available. Please create users first in the Users tab.</p>
                        ) : (
                          users.map((user) => (
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
                          ))
                        )}
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

              {/* Your Groups List Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Your Groups</h2>
                  <p className="text-gray-600">Select a group to manage expenses</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.length === 0 ? (
                      <p className="text-gray-500 col-span-full text-center">No groups found. Create one above!</p>
                    ) : (
                      groups.map((group) => (
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
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expenses Tab Content */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              {selectedGroup ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-semibold">Add Expense to {selectedGroup.name}</h2>
                    </div>
                    <p className="text-gray-600">Record a new shared expense</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expense-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <Input
                            id="expense-description"
                            value={expenseDescription}
                            onChange={(e) => setExpenseDescription(e.target.value)}
                            placeholder="What was this expense for?"
                          />
                        </div>
                        <div>
                          <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount ($)
                          </label>
                          <Input
                            id="expense-amount"
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="paid-by" className="block text-sm font-medium text-gray-700 mb-1">
                            Paid by
                          </label>
                          <Select
                            id="paid-by"
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
                          <label htmlFor="split-type" className="block text-sm font-medium text-gray-700 mb-1">
                            Split type
                          </label>
                          <Select
                            id="split-type"
                            value={splitType}
                            onChange={(value) => setSplitType(value as "equal" | "percentage")}
                          >
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

          {/* Balances Tab Content */}
          {activeTab === "balances" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Group Balances Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Group Balances</h2>
                  <p className="text-gray-600">
                    {selectedGroup ? `Balances for ${selectedGroup.name}` : "Select a group to view balances"}
                  </p>
                </CardHeader>
                <CardContent>
                  {selectedGroup ? (
                    groupBalances.length === 0 ? (
                      <p className="text-center py-4 text-gray-500">No balances to display for this group yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {groupBalances.map((balance) => (
                          <div key={balance.user_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                            <span className="font-medium">{balance.user_name}</span>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {balance.balance >= 0 ? "gets back" : "owes"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">Select a group to view balances</div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Balance Summary Section */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Personal Balance Summary</h2>
                  <p className="text-gray-600">Select a user to view their balance across all groups</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <label htmlFor="select-user-balance" className="sr-only">Select a user for balance</label>
                    <Select
                      id="select-user-balance"
                      value={selectedUserId?.toString() || ""}
                      onChange={(value) => handleUserBalanceSelect(Number.parseInt(value))}
                      placeholder="Select a user"
                    >
                      {users.length === 0 ? (
                        <option value="" disabled>No users available</option>
                      ) : (
                        users.map((user) => (
                          <option key={user.id} value={user.id.toString()}>
                            {user.name}
                          </option>
                        ))
                      )}
                    </Select>

                    {userBalances && (
                      <div className="space-y-3 mt-4 p-4 border rounded-lg bg-gray-50">
                        <div className="font-semibold text-lg text-gray-800">{userBalances.user_name}</div>
                        <hr className="border-gray-200" />
                        {userBalances.balances.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">No balances found for this user across groups.</div>
                        ) : (
                          userBalances.balances.map((balance) => (
                            <div
                              key={balance.group_id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                            >
                              <span className="font-medium text-gray-700">{balance.group_name}</span>
                              <div
                                className={`font-semibold ${balance.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                              </div>
                            </div>
                          ))
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
