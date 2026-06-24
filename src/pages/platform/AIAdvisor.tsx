import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Plan a 3-day adventure for 2 people under ₹20,000',
  'Best places for family water sports',
  'I want to trek and camp under the stars',
  'Aerial experiences — paragliding or hot-air balloon?',
];

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="ai-link">$1</a>')
    .replace(/\n/g, '<br/>');
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    setInput('');
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '' },
    ];
    setMessages(newMessages);
    setStreaming(true);

    try {
      const res = await fetch('/api/advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, I could not connect to the AI. Make sure `ANTHROPIC_API_KEY` is set in your Vercel environment.',
          };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const snapshot = full;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: snapshot };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="advisor">
      <div className="advisor__orbs" aria-hidden="true">
        <span className="orb orb--1" />
        <span className="orb orb--2" />
      </div>

      <header className="advisor__head">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="eyebrow">AI-powered</span>
          <h1>Maharashtra <span className="grad-text">Travel Advisor</span></h1>
          <p>Describe your dream trip and I'll match you with the perfect Maharashtra adventure.</p>
        </motion.div>
      </header>

      <div className="advisor__body">
        <div className="advisor__chat">
          {messages.length === 0 && (
            <div className="advisor__empty">
              <div className="advisor__empty-icon">✦</div>
              <p>Ask me anything about Maharashtra adventures</p>
              <div className="advisor__starters">
                {STARTERS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`advisor__msg advisor__msg--${msg.role}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {msg.role === 'assistant' && (
                  <span className="advisor__avatar">✦</span>
                )}
                <div
                  className="advisor__bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) || (streaming && i === messages.length - 1 ? '<span class="advisor__cursor">▊</span>' : '') }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <form
          className="advisor__input-row"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <textarea
            ref={inputRef}
            className="advisor__input"
            placeholder="Describe your ideal Maharashtra adventure…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            disabled={streaming}
          />
          <button
            type="submit"
            className="btn btn--primary advisor__send"
            disabled={!input.trim() || streaming}
            aria-label="Send"
          >
            {streaming ? '…' : '↑'}
          </button>
        </form>

        <p className="advisor__note">
          Powered by Claude AI · <Link to="/explore">Browse all destinations →</Link>
        </p>
      </div>
    </div>
  );
}
