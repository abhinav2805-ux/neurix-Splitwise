"use client"

import React, { Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom"

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
                  <NavLink
                    to="/users"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    Users
                  </NavLink>
                  <NavLink
                    to="/groups"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    Groups
                  </NavLink>
                  <NavLink
                    to="/expenses"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    Expenses
                  </NavLink>
                  <NavLink
                    to="/balances"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`
                    }
                  >
                    Balances
                  </NavLink>
                  <NavLink
                    to="/chatbot"
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors ${
                        isActive ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
                      }`
                    }
                  >
                    AI Assistant
                  </NavLink>
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
