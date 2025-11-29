
import React from "react";
import { createPortal } from "react-dom";
import { X, Brain } from "lucide-react";
import AIHelpChat from "../onboarding/AIHelpChat";

export default function GlobalAIHelpPanel() {
  const [open, setOpen] = React.useState(false);
  const [context, setContext] = React.useState("Analyze this data");
  const [key, setKey] = React.useState(0); // force chat remount when context changes

  React.useEffect(() => {
    const handler = (e) => {
      const nextContext = e?.detail?.context || "Analyze this data";
      setContext(nextContext);
      setKey((k) => k + 1);
      setOpen(true);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("knxw-open-ai-assistant", handler);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("knxw-open-ai-assistant", handler);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (!open || typeof document === "undefined") return null;

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed bottom-6 right-6 w-[92vw] max-w-[420px] rounded-2xl border border-[#262626] bg-[#0f0f0f] shadow-2xl overflow-hidden z-[2147483647]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#111111]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0ea5e9] flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-[#0a0a0a]" />
          </div>
          <span className="text-sm font-semibold text-white">AI Assistant</span>
        </div>
        <button
          type="button"
          aria-label="Close AI Assistant"
          onClick={() => setOpen(false)}
          className="text-[#a3a3a3] hover:text-white p-1 rounded-md hover:bg-[#1f1f1f]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-2 h-[70vh] max-h-[560px]">
        <AIHelpChat key={key} context={context} onClose={() => setOpen(false)} />
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
