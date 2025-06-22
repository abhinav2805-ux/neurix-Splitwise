import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

type User = { id: number; name: string };
type GroupType = { id: number; name: string; users: User[]; total_expenses?: number };
type Balance = { user_id: number; user_name: string; balance: number };
type UserBalance = { group_id: number; group_name: string; balance: number };
type UserBalancesResponse = { user_id: number; user_name: string; balances: UserBalance[] };
type GroupBalancesResponse = { group_id: number; group_name: string; balances: Balance[] };
type Settlement = { from_user_id: number; from_user_name: string; to_user_id: number; to_user_name: string; amount: number };

export default function BalancesPage() {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [groupBalances, setGroupBalances] = useState<Balance[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userBalances, setUserBalances] = useState<UserBalancesResponse | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settleLoading, setSettleLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/groups`).then(res => setGroups(res.data));
    axios.get(`${API_BASE}/users`).then(res => setUsers(res.data));
  }, []);

  const handleGroupClick = async (group: GroupType) => {
    setSelectedGroup(group);
    const res = await axios.get<GroupBalancesResponse>(`${API_BASE}/groups/${group.id}/balances`);
    setGroupBalances(res.data.balances);
    setSettleLoading(true);
    try {
      const settleRes = await axios.get<{ settlements: Settlement[] }>(`${API_BASE}/groups/${group.id}/settle`);
      setSettlements(settleRes.data.settlements);
    } finally {
      setSettleLoading(false);
    }
  };

  const handleUserSelect = async (userId: number) => {
    setSelectedUserId(userId);
    const res = await axios.get<UserBalancesResponse>(`${API_BASE}/users/${userId}/balances`);
    setUserBalances(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-cyan-400 sci-fi-glass">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold sci-fi-glow">All Groups</h2>
          <p className="text-gray-400">Click a group to view balances</p>
        </div>
        <div className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedGroup?.id === group.id ? 'border-cyan-400 bg-cyan-950/10' : 'border-gray-200 bg-white hover:border-cyan-400'}`}
                onClick={() => handleGroupClick(group)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-cyan-300">{group.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">{group.users.length} members</span>
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
        </div>
      </div>
      {selectedGroup && (
        <div className="bg-white rounded-lg shadow-md border border-cyan-400 sci-fi-glass">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold sci-fi-glow">Balances for {selectedGroup.name}</h2>
            <p className="text-gray-400">See who owes or gets back how much</p>
          </div>
          <div className="p-6 pt-0 space-y-3">
            {groupBalances.map((balance) => (
              <div key={balance.user_id} className="flex items-center justify-between p-3 border border-cyan-400 rounded-lg bg-cyan-950/10">
                <span className="font-medium text-cyan-200">{balance.user_name}</span>
                <div className="text-right">
                  <div className={`font-semibold ${balance.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">{balance.balance >= 0 ? "gets back" : "owes"}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 pt-0">
            <h3 className="text-lg sci-fi-glow mb-2">Settlements</h3>
            {settleLoading ? (
              <div className="text-cyan-400">Loading settlements...</div>
            ) : settlements.length === 0 ? (
              <div className="text-gray-400">No settlements needed.</div>
            ) : (
              <div className="space-y-2">
                {settlements.map((s, i) => (
                  <div key={i} className="p-2 border border-cyan-400 rounded bg-cyan-950/10">
                    <span className="text-cyan-300 font-bold">{s.from_user_name}</span> pays <span className="text-purple-300 font-bold">{s.to_user_name}</span> <span className="text-green-400">${s.amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-md border border-cyan-400 sci-fi-glass">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold sci-fi-glow">Personal Balance Summary</h2>
          <p className="text-gray-400">Select a user to view their balance across all groups</p>
        </div>
        <div className="p-6 pt-0 space-y-4">
          <select
            value={selectedUserId?.toString() || ''}
            onChange={e => handleUserSelect(Number(e.target.value))}
            className="w-full px-3 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
          {userBalances && (
            <div className="space-y-3">
              <div className="font-semibold text-lg text-cyan-200">{userBalances.user_name}</div>
              <hr className="border-cyan-400" />
              {userBalances.balances.map((balance) => (
                <div
                  key={balance.group_id}
                  className="flex items-center justify-between p-3 border border-cyan-400 rounded-lg bg-cyan-950/10"
                >
                  <span className="font-medium text-cyan-200">{balance.group_name}</span>
                  <div className={`font-semibold ${balance.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {balance.balance >= 0 ? "+" : ""}${balance.balance.toFixed(2)}
                  </div>
                </div>
              ))}
              {userBalances.balances.length === 0 && (
                <div className="text-center py-4 text-gray-400">No balances found for this user</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
