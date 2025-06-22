import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = "http://localhost:8000";

type User = { id: number; name: string };
type GroupType = { id: number; name: string; users: User[]; total_expenses?: number };

export default function GroupsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
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
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/groups`);
      setGroups(res.data);
    } catch (err) {
      setError("Failed to fetch groups");
    }
  };
  useEffect(() => { fetchUsers(); fetchGroups(); }, []);

  const handleUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUserIds.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/groups`, {
        name: newGroupName,
        user_ids: selectedUserIds,
      });
      setNewGroupName("");
      setSelectedUserIds([]);
      await fetchGroups();
      setError(null);
      toast.success('Group created!');
    } catch (err) {
      setError("Failed to create group");
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (!window.confirm(`Are you sure you want to delete group '${groupName}'? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/groups/${groupId}`);
      await fetchGroups();
      toast.success(`Group '${groupName}' deleted!`);
    } catch (err) {
      setError("Failed to delete group");
      toast.error('Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Create New Group</h2>
          </div>
          <p className="text-gray-600">Create a group and add members</p>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      checked={selectedUserIds.includes(user.id)}
                      onChange={e => handleUserSelection(user.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm font-normal cursor-pointer">
                      {user.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={loading || !newGroupName.trim() || selectedUserIds.length === 0}
              className="w-full px-4 py-2 rounded-lg font-medium sci-fi-btn"
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <p className="text-gray-600">Select a group to manage expenses</p>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div key={group.id} className="p-4 border rounded-lg bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold mr-2">{group.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{group.users.length} members</span>
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
                <button
                  className="ml-4 px-2 py-1 rounded sci-fi-btn flex items-center gap-1"
                  style={{ background: 'linear-gradient(90deg, #ff4d4f 0%, #7f00ff 100%)', boxShadow: '0 0 8px #ff4d4f, 0 0 2px #7f00ff' }}
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  disabled={loading}
                  title="Delete group"
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
          <span className="w-5 h-5 text-red-600 flex-shrink-0">!</span>
          <div className="text-red-800">{error}</div>
        </div>
      )}
    </div>
  );
} 