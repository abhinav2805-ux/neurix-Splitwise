"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Plus, Users, AlertCircle } from "lucide-react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE

type User = { id: number; name: string }
type GroupType = { id: number; name: string; users: User[]; total_expenses?: number }

export default function GroupsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<GroupType[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
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

  useEffect(() => {
    fetchUsers()
    fetchGroups()
  }, [])

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId])
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId))
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
      toast.success("Group created successfully!")
    } catch (err) {
      setError("Failed to create group")
      toast.error("Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Group Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create New Group</h2>
              <p className="text-slate-600">Create a group and add members</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Members ({selectedUserIds.length} selected)
              </label>
              {users.length === 0 ? (
                <p className="text-slate-500 text-sm">No users available. Create users first.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={loading || !newGroupName.trim() || selectedUserIds.length === 0}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Group
            </button>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your Groups</h2>
              <p className="text-slate-600">{groups.length} groups created</p>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No groups found. Create your first group above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="p-6 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{group.name}</h3>
                      <p className="text-sm text-slate-500">ID: {group.id}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {group.users.length} members
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Members:</p>
                    <div className="flex flex-wrap gap-2">
                      {group.users.map((user) => (
                        <span
                          key={user.id}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                        >
                          {user.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {group.total_expenses !== undefined && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600">
                        Total expenses:{" "}
                        <span className="font-semibold text-slate-900">${group.total_expenses.toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-red-800">{error}</div>
        </div>
      )}
    </div>
  )
}
