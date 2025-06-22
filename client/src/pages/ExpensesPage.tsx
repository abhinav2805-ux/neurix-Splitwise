import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = "http://localhost:8000";

type User = { id: number; name: string };
type GroupType = { id: number; name: string; users: User[]; total_expenses?: number };
type Expense = {
  id: number;
  description: string;
  amount: number;
  paid_by: number;
  split_type: string;
  splits: { user_id: number; amount: number; percentage: number }[];
};

export default function ExpensesPage() {
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState<number | null>(null);
  const [splitType, setSplitType] = useState<'equal' | 'percentage'>('equal');
  const [percentages, setPercentages] = useState<{ [uid: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/groups`).then(res => setGroups(res.data));
  }, []);

  const fetchExpenses = async (groupId: number) => {
    setExpensesLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleGroupClick = (group: GroupType) => {
    setSelectedGroup(group);
    setDesc('');
    setAmount('');
    setPaidBy(group.users[0]?.id || null);
    setSplitType('equal');
    setPercentages({});
    setError(null);
    setSuccess(null);
    fetchExpenses(group.id);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !desc.trim() || !amount || !paidBy) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    let splits: any[] = [];
    if (splitType === 'percentage') {
      splits = selectedGroup.users.map(u => ({
        user_id: u.id,
        amount: (Number(amount) * (Number(percentages[u.id]) || 0) / 100),
        percentage: Number(percentages[u.id]) || 0
      }));
    }
    try {
      await axios.post(`${API_BASE}/groups/${selectedGroup.id}/expenses`, {
        description: desc,
        amount: Number(amount),
        paid_by: paidBy,
        split_type: splitType,
        splits: splitType === 'equal' ? undefined : splits
      });
      setSuccess('Expense added!');
      toast.success('Expense added!');
      setDesc('');
      setAmount('');
      setPercentages({});
      fetchExpenses(selectedGroup.id);
    } catch (err) {
      setError('Failed to add expense');
      toast.error('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const totalPercentage = splitType === 'percentage'
    ? selectedGroup
      ? selectedGroup.users.reduce((sum, u) => sum + (Number(percentages[u.id]) || 0), 0)
      : 0
    : 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-cyan-400 sci-fi-glass">
        <div className="p-6 pb-4">
          <h2 className="text-xl font-semibold sci-fi-glow">All Groups</h2>
          <p className="text-gray-400">Click a group to add an expense</p>
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
            <h2 className="text-xl font-semibold sci-fi-glow">Add Expense to {selectedGroup.name}</h2>
            <p className="text-gray-400">Record a new shared expense</p>
          </div>
          <form className="p-6 pt-0 space-y-4" onSubmit={handleAddExpense}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="What was this expense for?"
                  className="w-full px-3 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
                <select
                  value={paidBy?.toString() || ''}
                  onChange={e => setPaidBy(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  {selectedGroup.users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Split type</label>
                <select
                  value={splitType}
                  onChange={e => setSplitType(e.target.value as 'equal' | 'percentage')}
                  className="w-full px-3 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="equal">Equal split</option>
                  <option value="percentage">Percentage split</option>
                </select>
              </div>
            </div>
            {splitType === 'percentage' && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentages</label>
                {selectedGroup.users.map(u => (
                  <div key={u.id} className="flex items-center mb-1">
                    <span className="w-24">{u.name}</span>
                    <input
                      type="number"
                      placeholder="%"
                      value={percentages[u.id] || ''}
                      onChange={e => setPercentages(p => ({ ...p, [u.id]: e.target.value }))}
                      min={0}
                      max={100}
                      className="w-20 ml-2 px-2 py-1 border border-cyan-400 rounded"
                    />
                    <span className="ml-2 text-cyan-600">%</span>
                  </div>
                ))}
                <div className="mt-2 text-sm">
                  Total: <span className={totalPercentage === 100 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{totalPercentage}%</span>
                </div>
                {totalPercentage !== 100 && (
                  <div className="text-red-500 text-xs mt-1">Total percentage must be exactly 100%</div>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !desc.trim() || !amount || !paidBy || (splitType === 'percentage' && totalPercentage !== 100)}
              className="w-full px-4 py-2 rounded-lg font-bold sci-fi-btn"
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </form>
        </div>
      )}
    </div>
  );
} 