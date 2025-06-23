"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { UserPlus, Plus, AlertCircle, Users } from "lucide-react"
import { toast } from "sonner"

const API_BASE = import.meta.env.VITE_API_BASE

export default function UsersPage() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([])
  const [newUserName, setNewUserName] = useState("")
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/users`, { name: newUserName })
      setNewUserName("")
      await fetchUsers()
      setError(null)
      toast.success("User created successfully!")
    } catch (err) {
      setError("Failed to create user")
      toast.error("Failed to create user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create User Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create New User</h2>
              <p className="text-slate-600">Add a new user to the system</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">User Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                onKeyPress={(e) => e.key === "Enter" && handleCreateUser()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateUser}
                disabled={loading || !newUserName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">All Users</h2>
              <p className="text-slate-600">{users.length} users in the system</p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">No users found. Create your first user above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-500">ID: {user.id}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
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
