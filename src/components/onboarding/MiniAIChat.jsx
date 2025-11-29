
import React from "react";
import { Send } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";

export default function MiniAIChat({ context }) {
  const [messages, setMessages] = React.useState(() => {
    const initial = (typeof context === "string" && context.trim().length > 0)
      ? `I'm ready to help! Ask me anything about: ${context}.`
      : "I'm ready to help! What would you like to know about this section?";
    return [{ role: "assistant", content: initial }];
  });
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const buildPrompt = () => {
    const header = `You are knXw's AI assistant embedded within a specific dashboard card. Be concise, actionable, and contextual to this card.`;
    const ctx = typeof context === "string" ? context : JSON.stringify(context || {});
    const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
    return `${header}\n\nCard context: ${ctx}\n\nConversation so far:\n${history}\n\nRespond to the last USER message clearly and briefly, with bullet points where helpful.`;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await InvokeLLM({
        prompt: buildPrompt(),
        add_context_from_internet: false
      });
      // Integration may return a string or object; normalize
      const reply = typeof res === "string"
        ? res
        : (typeof res?.reply === "string" ? res.reply
          : (typeof res?.output === "string" ? res.output
            : (typeof res?.message === "string" ? res.message
              : (typeof res?.data === "string" ? res.data
                : "Here’s what I found."))));
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("MiniAIChat error:", e);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I hit a snag. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-3 min-h-[220px]">
      <div className="space-y-2 max-h-[50vh] overflow-auto pr-1">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-2xl px-3 py-2 text-sm leading-relaxed max-w-[85%] ${
                m.role === "user" ? "bg-[#0d0d0d] border border-[#262626]" : "bg-[#1a1a1a] border border-[#262626]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3 py-2 text-sm bg-[#1a1a1a] border border-[#262626]">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <input
          className="flex-1 bg-[#0d0d0d] border border-[#262626] rounded-xl px-3 py-2 text-sm text-white placeholder-[#6b7280] outline-none focus:border-[#00d4ff]/50"
          placeholder="Ask a follow-up question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Ask a follow-up question"
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-[#00d4ff] text-[#0a0a0a] rounded-xl px-3 py-2 hover:bg-[#0ea5e9] transition disabled:opacity-60"
          aria-label="Send"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
