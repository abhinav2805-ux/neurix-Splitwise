"use client"

import React, { Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom"

const UsersPage = React.lazy(() => import("./pages/UsersPage"))
const GroupsPage = React.lazy(() => import("./pages/GroupsPage"))
const ExpensesPage = React.lazy(() => import("./pages/ExpensesPage"))
const BalancesPage = React.lazy(() => import("./pages/BalancesPage"))
const ChatbotPage = React.lazy(() => import("./pages/ChatbotPage"))

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Splitlyze</h1>
                  <p className="text-sm text-slate-600">Manage your shared expenses</p>
                </div>
                <nav className="flex gap-2">
                  <Link
                    to="/users"
                    className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    to="/groups"
                    className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Groups
                  </Link>
                  <Link
                    to="/expenses"
                    className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Expenses
                  </Link>
                  <Link
                    to="/balances"
                    className="px-4 py-2 rounded-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Balances
                  </Link>
                  <Link
                    to="/chatbot"
                    className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    AI Assistant
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-6 pb-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600">Loading...</span>
                </div>
              }
            >
              <Routes>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/balances" element={<BalancesPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/" element={<Navigate to="/users" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  )
}
