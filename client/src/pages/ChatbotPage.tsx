"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Send, Bot, User, Sparkles } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_BASE
const CHATBOT_API_URL = `${API_BASE}/chatbot`

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim()) return

    const userMsg = { sender: "user" as const, text: input }
    setMessages((msgs) => [...msgs, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Unknown error")
      }

      const data = await res.json()
      setMessages((msgs) => [...msgs, { sender: "bot", text: data.answer }])
    } catch (err: any) {
      setMessages((msgs) => [...msgs, { sender: "bot", text: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">AI Assistant</h2>
              <p className="text-slate-600">Ask anything about your expenses, groups, or balances</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Welcome to your AI Assistant!</h3>
              <p className="text-slate-600 mb-6">
                I can help you with questions about your expenses, groups, and balances.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput("What's my total balance across all groups?")}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">Check my balances</p>
                  <p className="text-slate-600 text-xs">View your balance summary</p>
                </button>
                <button
                  onClick={() => setInput("Show me recent expenses for my groups")}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">Recent expenses</p>
                  <p className="text-slate-600 text-xs">See latest group expenses</p>
                </button>
                <button
                  onClick={() => setInput("Who owes money in my groups?")}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">Settlement info</p>
                  <p className="text-slate-600 text-xs">Check who owes what</p>
                </button>
                <button
                  onClick={() => setInput("Help me understand how to split expenses")}
                  className="p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <p className="font-medium text-slate-900 text-sm">How to use</p>
                  <p className="text-slate-600 text-xs">Learn about expense splitting</p>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 rounded-lg ${
                  msg.sender === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-slate-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Ask me anything about your expenses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              disabled={loading || !input.trim()}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
