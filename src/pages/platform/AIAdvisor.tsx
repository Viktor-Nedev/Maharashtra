import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlannerStore } from '@/lib/store';
import { buildItinerary, itineraryToMarkdown } from '@/lib/itinerary';
import { useAuthStore } from '@/lib/authStore';
import { toast } from '@/lib/toastStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Plan a 3-day adventure for 2 people under ₹20,000',
  'Best places for family water sports in Maharashtra',
  'I want to trek and camp under the stars',
  'Aerial experiences — paragliding or hot-air balloon?',
];

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="ai-link">$1</a>')
    .replace(/\n/g, '<br/>');
}

function AuthGate() {
  const navigate = useNavigate();
  return (
    <motion.div
      className="advisor__auth-gate"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="advisor__auth-icon">✦</div>
      <h2>Sign in to use AI Advisor</h2>
      <p>
        Get personalised Maharashtra adventure recommendations powered by Gemini AI
        — plan your perfect trip in seconds.
      </p>
      <div className="advisor__auth-cta">
        <button className="btn btn--primary" onClick={() => navigate('/login')}>
          Sign in
        </button>
        <Link to="/register" className="btn btn--ghost">
          Create account
        </Link>
      </div>
    </motion.div>
  );
}

export default function AIAdvisor() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { setBudgetCap, addStop, addItem } = usePlannerStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateItinerary = () => {
    const it = buildItinerary({ days: 3, people: 2, budget: 25000 });
    setBudgetCap(it.budget);
    for (const day of it.days) {
      for (const a of day.activities) {
        addStop(`Day ${day.day} · ${a.name} (${day.destination.name})`);
      }
      addItem(`Day ${day.day} · ${day.destination.name}`, day.subtotal);
    }
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'Generate a 3-day itinerary for 2 people under ₹25,000' },
      { role: 'assistant', content: itineraryToMarkdown(it) },
    ]);
    toast('Itinerary saved to your Trip Planner ✓', 'success');
  };

  const addToPlan = (content: string) => {
    const matches = content.match(
      /\b(Sahyadri|Pawna|Bhimashankar|Harishchandragad|Mahabaleshwar|Tarkarli|Lonavala|Kamshet|Panchgani|Matheran|Alibaug|Kolad)\b/gi,
    );
    if (matches) {
      const unique = [...new Set(matches.map((m) => m.charAt(0).toUpperCase() + m.slice(1)))];
      unique.forEach((dest) => addStop(dest));
      toast(`Added ${unique.slice(0, 2).join(', ')} to your Trip Planner ✓`, 'success');
    } else {
      addStop('AI-suggested destination');
      toast('Added suggestion to your Trip Planner ✓', 'success');
    }
  };

  const send = async (text: string) => {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    setInput('');
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    try {
      const res = await fetch('/api/gemini-advise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content:
              'Sorry, I could not connect to the AI. Make sure `GEMINI_API_KEY` is set in your environment.',
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">AI-powered</span>
          <h1>
            Maharashtra <span className="grad-text">Travel Advisor</span>
          </h1>
          <p>
            Describe your dream trip and Gemini AI will match you with the perfect
            Maharashtra adventure.
          </p>
          {user && (
            <div className="advisor__quick-actions">
              <button
                className="btn btn--primary btn--sm"
                onClick={generateItinerary}
                disabled={streaming}
              >
                ✦ Generate 3-day itinerary
              </button>
              <Link to="/planner" className="btn btn--ghost btn--sm">
                Open Trip Planner →
              </Link>
            </div>
          )}
        </motion.div>
      </header>

      <div className="advisor__body">
        {!user ? (
          <AuthGate />
        ) : (
          <>
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
                    <div className="advisor__bubble-wrap">
                      <div
                        className="advisor__bubble"
                        dangerouslySetInnerHTML={{
                          __html:
                            renderMarkdown(msg.content) ||
                            (streaming && i === messages.length - 1
                              ? '<span class="advisor__cursor">▊</span>'
                              : ''),
                        }}
                      />
                      {msg.role === 'assistant' && msg.content && !streaming && (
                        <button
                          className="btn btn--ghost btn--xs advisor__add-plan"
                          onClick={() => addToPlan(msg.content)}
                        >
                          + Add to Plan
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <form
              className="advisor__input-row"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
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
          </>
        )}

        <p className="advisor__note">
          Powered by Gemini AI ·{' '}
          <Link to="/explore">Browse all destinations →</Link>
        </p>
      </div>
    </div>
  );
}
