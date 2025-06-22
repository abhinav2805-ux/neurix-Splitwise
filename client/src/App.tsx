"use client"

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

const UsersPage = React.lazy(() => import('./pages/UsersPage'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const ExpensesPage = React.lazy(() => import('./pages/ExpensesPage'));
const BalancesPage = React.lazy(() => import('./pages/BalancesPage'));
const ChatbotPage = React.lazy(() => import('./pages/ChatbotPage'));

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-4 mb-8 justify-center">
            <Link to="/users" className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">Users</Link>
            <Link to="/groups" className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">Groups</Link>
            <Link to="/expenses" className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">Expenses</Link>
            <Link to="/balances" className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700">Balances</Link>
            <Link to="/chatbot" className="px-4 py-2 rounded-lg font-medium bg-cyan-600 text-white hover:bg-cyan-700 sci-fi-glow">AI Assistant</Link>
          </nav>
          <Suspense fallback={<div className="text-center text-lg">Loading...</div>}>
            <Routes>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/balances" element={<BalancesPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/" element={<Navigate to="/users" replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}
