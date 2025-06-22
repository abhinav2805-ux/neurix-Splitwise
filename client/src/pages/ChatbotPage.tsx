import React, { useRef, useState } from 'react';
import { Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE;
const CHATBOT_API_URL = `${API_BASE}/chatbot`;

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Unknown error');
      }
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: data.answer },
      ]);
    } catch (err: any) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[80vh] bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl shadow-lg border border-cyan-400 border-opacity-30 sci-fi-glass">
      <div className="p-4 border-b border-cyan-400 text-center">
        <h2 className="text-2xl sci-fi-glow">AI Assistant</h2>
        <p className="text-cyan-200 text-sm mt-1">Ask anything about your expenses, groups, or balances!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-cyan-400 mt-8">Start a conversation with your AI assistant!</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-xl shadow sci-fi-glass ${msg.sender === 'user' ? 'bg-cyan-600 text-white ml-auto' : 'bg-cyan-950/30 text-cyan-200 mr-auto'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-cyan-400 bg-black/40 rounded-b-xl">
        <input
          className="flex-1 px-4 py-2 rounded-lg bg-black bg-opacity-40 border border-cyan-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="sci-fi-btn flex items-center gap-1 px-4 py-2"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full"></span>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
} 