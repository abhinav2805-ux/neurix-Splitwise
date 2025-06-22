import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, Plus, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = "http://localhost:8000";

export default function UsersPage() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [newUserName, setNewUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!newUserName.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/users`, { name: newUserName });
      setNewUserName("");
      await fetchUsers();
      setError(null);
      toast.success('User created!');
    } catch (err) {
      setError("Failed to create user");
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user '${userName}'? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/users/${userId}`);
      await fetchUsers();
      toast.success(`User '${userName}' deleted!`);
    } catch (err) {
      setError("Failed to delete user");
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Create New User</h2>
          </div>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>
        <div className="p-6 pt-0">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="Enter user name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button onClick={handleCreateUser} disabled={loading || !newUserName.trim()} className="px-4 py-2 rounded-lg font-medium sci-fi-btn">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-gray-600">Manage existing users</p>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">ID: {user.id}</span>
                </div>
                <button
                  className="ml-4 px-2 py-1 rounded sci-fi-btn flex items-center gap-1"
                  style={{ background: 'linear-gradient(90deg, #ff4d4f 0%, #7f00ff 100%)', boxShadow: '0 0 8px #ff4d4f, 0 0 2px #7f00ff' }}
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  disabled={loading}
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="text-red-800">{error}</div>
        </div>
      )}
    </div>
  );
} 